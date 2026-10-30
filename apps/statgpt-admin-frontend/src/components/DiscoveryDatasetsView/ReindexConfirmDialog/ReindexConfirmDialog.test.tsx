/** @jest-environment jsdom */
/* global describe, it, expect, jest */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { DiscoveryIndexingStage } from '@/src/models/discovery-dataset';
import { PopUpState } from '@/src/types/modal';
import { ReindexConfirmDialog } from './ReindexConfirmDialog';

jest.mock(
  '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog',
  () => ({
    __esModule: true,
    ConfirmDialog: ({
      children,
      confirmLabel,
      onClose,
    }: {
      children: ReactNode;
      confirmLabel: string;
      onClose: (confirmed: boolean) => void;
    }) => (
      <div>
        {children}
        <button onClick={() => onClose(true)}>{confirmLabel}</button>
      </div>
    ),
  }),
);

const renderDialog = () => {
  const onClose = jest.fn();
  const view = render(
    <ReindexConfirmDialog modalState={PopUpState.Opened} onClose={onClose} />,
  );
  return { onClose, ...view };
};

const checkbox = (name: string) =>
  screen.getByRole('checkbox', { name }) as HTMLInputElement;

describe('ReindexConfirmDialog', () => {
  it('forces no stage by default', () => {
    const { onClose } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Reindex' }));

    expect(onClose).toHaveBeenCalledWith({ confirmed: true, force: [] });
  });

  it('forces only the selected stages', () => {
    const { onClose } = renderDialog();

    fireEvent.click(checkbox('Republish documents'));
    fireEvent.click(screen.getByRole('button', { name: 'Reindex' }));

    expect(onClose).toHaveBeenCalledWith({
      confirmed: true,
      force: [DiscoveryIndexingStage.Publishing],
    });
  });

  it('keeps one entry per stage however often it is toggled', () => {
    const { onClose } = renderDialog();

    fireEvent.click(checkbox('Re-summarize indicators'));
    fireEvent.click(checkbox('Republish documents'));
    fireEvent.click(checkbox('Re-summarize indicators'));
    fireEvent.click(checkbox('Re-summarize indicators'));
    fireEvent.click(screen.getByRole('button', { name: 'Reindex' }));

    expect(onClose).toHaveBeenCalledWith({
      confirmed: true,
      force: [
        DiscoveryIndexingStage.Publishing,
        DiscoveryIndexingStage.Summarization,
      ],
    });
  });

  it('clears the selection when the dialog is opened again', () => {
    const { rerender } = renderDialog();
    const onClose = jest.fn();

    fireEvent.click(checkbox('Republish documents'));
    rerender(
      <ReindexConfirmDialog modalState={PopUpState.Closed} onClose={onClose} />,
    );
    rerender(
      <ReindexConfirmDialog modalState={PopUpState.Opened} onClose={onClose} />,
    );

    expect(checkbox('Republish documents').checked).toBe(false);
  });
});
