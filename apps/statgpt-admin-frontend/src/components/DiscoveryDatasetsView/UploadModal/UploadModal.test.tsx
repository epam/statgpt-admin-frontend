/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { sendPostRequest } from '@/src/server/api';
import { UploadModal } from './UploadModal';

jest.mock('@/src/components/BaseComponents/LoadFileArea/LoadFileArea', () => ({
  __esModule: true,
  LoadFileAreaField: ({
    onChangeFile,
  }: {
    onChangeFile: (files?: FileList) => void;
  }) => (
    <button
      onClick={() =>
        onChangeFile([new File([], 'test.csv')] as unknown as FileList)
      }
    >
      select file
    </button>
  ),
}));

jest.mock('@/src/server/api', () => ({
  sendPostRequest: jest.fn(),
}));

const mockedSendPostRequest = sendPostRequest as jest.Mock;

const toggleSwitch = (switchId: string): void => {
  fireEvent.click(document.getElementById(switchId) as HTMLInputElement);
};

const renderModal = () =>
  render(<UploadModal channelId="42" close={() => {}} onUploaded={() => {}} />);

describe('UploadModal', () => {
  beforeEach(() => {
    mockedSendPostRequest.mockReset();
    mockedSendPostRequest.mockResolvedValue({
      ok: true,
      data: {
        created: 0,
        updated: 0,
        unchanged: 0,
        deleted: 0,
        rowsRead: 0,
        rowsSkipped: 0,
      },
    });
  });

  it('uploads immediately when replace is off', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'select file' }));
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(mockedSendPostRequest).toHaveBeenCalled());
    expect(mockedSendPostRequest.mock.calls[0][0]).toContain('mode=upsert');
    expect(screen.queryByText(/permanently delete/i)).toBeNull();
  });

  it('shows a confirm step instead of uploading when replace is on', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'select file' }));
    toggleSwitch('upload-replace');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(screen.getByText(/permanently delete/i)).toBeTruthy();
    expect(mockedSendPostRequest).not.toHaveBeenCalled();
  });

  it('uploads with replace mode after confirming', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'select file' }));
    toggleSwitch('upload-replace');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Upload' }));

    await waitFor(() => expect(mockedSendPostRequest).toHaveBeenCalled());
    expect(mockedSendPostRequest.mock.calls[0][0]).toContain('mode=replace');
  });

  it('returns to the select step on Back without uploading', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'select file' }));
    toggleSwitch('upload-replace');
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('button', { name: 'Upload' })).toBeTruthy();
    expect(mockedSendPostRequest).not.toHaveBeenCalled();
  });
});
