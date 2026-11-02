/** @jest-environment jsdom */
/* global describe, it, expect, jest */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';

import { UploadFileField } from './UploadFileField';

jest.mock('@/src/components/BaseComponents/LoadFileArea/LoadFileArea', () => ({
  __esModule: true,
  LoadFileArea: ({
    onChangeFile,
  }: {
    onChangeFile: (files?: FileList) => void;
  }) => (
    <button
      onClick={() =>
        onChangeFile([new File([], 'dropped.csv')] as unknown as FileList)
      }
    >
      drop area
    </button>
  ),
}));

const renderField = (
  props: Partial<ComponentProps<typeof UploadFileField>> = {},
) =>
  render(
    <UploadFileField
      acceptTypes=".csv,.xlsx"
      onChangeFile={() => {}}
      {...props}
    />,
  );

const getFileInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('UploadFileField', () => {
  it('shows the drop area while no file is chosen', () => {
    renderField();

    expect(screen.getByRole('button', { name: 'drop area' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Change file' })).toBeNull();
  });

  it('passes the first dropped file to onChangeFile', () => {
    const onChangeFile = jest.fn();
    renderField({ onChangeFile });

    fireEvent.click(screen.getByRole('button', { name: 'drop area' }));

    expect(onChangeFile).toHaveBeenCalledTimes(1);
    expect((onChangeFile.mock.calls[0][0] as File).name).toBe('dropped.csv');
  });

  it('shows the file name and a Change file action once a file is chosen', () => {
    renderField({ file: new File([], 'World Economic Outlook (WEO).csv') });

    expect(screen.getByText('World Economic Outlook (WEO).csv')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change file' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'drop area' })).toBeNull();
  });

  it('does not render an editable text input for the file name', () => {
    const { container } = renderField({ file: new File([], 'data.csv') });

    expect(container.querySelector('input[type="text"]')).toBeNull();
  });

  it('passes the newly picked file to onChangeFile', () => {
    const onChangeFile = jest.fn();
    const { container } = renderField({
      file: new File([], 'old.csv'),
      onChangeFile,
    });
    const newFile = new File([], 'new.csv');

    fireEvent.change(getFileInput(container), {
      target: { files: [newFile] },
    });

    expect(onChangeFile).toHaveBeenCalledWith(newFile);
  });

  it('hands over the picked file before the input is reset', () => {
    const onChangeFile = jest.fn();
    const { container } = renderField({
      file: new File([], 'old.csv'),
      onChangeFile,
    });
    const input = getFileInput(container);
    const liveList = [new File([], 'new.csv')];
    // Browsers empty the live `input.files` list when `value` is reset.
    Object.defineProperty(input, 'files', { get: () => liveList });
    Object.defineProperty(input, 'value', {
      set: () => {
        liveList.length = 0;
      },
    });

    fireEvent.change(input);

    expect(onChangeFile).toHaveBeenCalledTimes(1);
    expect((onChangeFile.mock.calls[0][0] as File).name).toBe('new.csv');
  });

  it('ignores a change event that carries no files', () => {
    const onChangeFile = jest.fn();
    const { container } = renderField({
      file: new File([], 'old.csv'),
      onChangeFile,
    });

    fireEvent.change(getFileInput(container), { target: { files: [] } });

    expect(onChangeFile).not.toHaveBeenCalled();
  });

  it('links the file input to the error and flags it invalid when rejected', () => {
    const { container } = renderField({
      file: new File([], 'bad.csv'),
      invalid: true,
      errorId: 'file-error',
    });
    const input = getFileInput(container);

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('file-error');
  });

  it('keeps the file input free of error attributes when the file is fine', () => {
    const { container } = renderField({
      file: new File([], 'good.csv'),
      errorId: 'file-error',
    });
    const input = getFileInput(container);

    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
});
