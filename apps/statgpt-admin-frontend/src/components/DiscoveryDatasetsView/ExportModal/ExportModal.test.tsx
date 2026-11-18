/** @jest-environment jsdom */
/* global describe, it, expect, jest */
import { fireEvent, render, screen } from '@testing-library/react';

import { DiscoveryExportFormat } from '@/src/models/discovery-dataset';
import { ExportModal } from './ExportModal';

const VALIDATION_CHECKBOX_ID = 'export-include-validation';

const renderModal = () => {
  const close = jest.fn();
  const onExport = jest.fn();
  render(<ExportModal close={close} onExport={onExport} />);
  return { close, onExport };
};

const chooseCsv = () => {
  fireEvent.mouseDown(screen.getByText('Excel (.xlsx)'));
  fireEvent.click(screen.getByText('CSV (.csv)'));
};

describe('ExportModal', () => {
  it('offers Excel and validation statuses by default', () => {
    renderModal();

    expect(screen.getByText('Export Grade C datasets')).toBeTruthy();
    expect(screen.getByText('Excel (.xlsx)')).toBeTruthy();
    expect(
      (document.getElementById(VALIDATION_CHECKBOX_ID) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it('explains what each option does', () => {
    renderModal();

    expect(screen.getByText(/matches the upload template/i)).toBeTruthy();
    expect(
      screen.getByText(/validation status, time and issues columns/i),
    ).toBeTruthy();
  });

  it('exports Excel with validation statuses when nothing is changed', () => {
    const { onExport, close } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(onExport).toHaveBeenCalledWith({
      format: DiscoveryExportFormat.Excel,
      includeValidation: true,
    });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('exports CSV when CSV is chosen', () => {
    const { onExport } = renderModal();

    chooseCsv();
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(onExport).toHaveBeenCalledWith({
      format: DiscoveryExportFormat.Csv,
      includeValidation: true,
    });
  });

  it('exports without validation statuses when the checkbox is cleared', () => {
    const { onExport } = renderModal();

    fireEvent.click(
      document.getElementById(VALIDATION_CHECKBOX_ID) as HTMLInputElement,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(onExport).toHaveBeenCalledWith({
      format: DiscoveryExportFormat.Excel,
      includeValidation: false,
    });
  });

  it('closes without exporting on Cancel', () => {
    const { onExport, close } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(close).toHaveBeenCalledTimes(1);
    expect(onExport).not.toHaveBeenCalled();
  });
});
