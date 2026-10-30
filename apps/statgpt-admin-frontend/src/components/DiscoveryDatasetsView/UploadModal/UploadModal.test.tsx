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

const SWITCH_ID = 'upload-delete-absent';

const toggleSwitch = (): void => {
  fireEvent.click(document.getElementById(SWITCH_ID) as HTMLInputElement);
};

const selectFile = (): void => {
  fireEvent.click(screen.getByRole('button', { name: 'select file' }));
};

const renderModal = () =>
  render(<UploadModal channelId="42" close={() => {}} onUploaded={() => {}} />);

const rejectUpload = (detail: object): void => {
  mockedSendPostRequest.mockResolvedValue({
    ok: false,
    error: { message: 'fallback', raw: { detail } },
  });
};

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
      },
    });
  });

  it('uploads in upsert mode when the delete toggle is off', async () => {
    renderModal();

    selectFile();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(mockedSendPostRequest).toHaveBeenCalled());
    expect(mockedSendPostRequest.mock.calls[0][0]).toContain('mode=upsert');
  });

  it('reveals the warning banner when the delete toggle is on, keeping its space reserved', () => {
    renderModal();

    selectFile();
    const isHidden = () =>
      screen
        .getByText(/permanently deleted/i)
        .closest('[aria-hidden="true"]') != null;
    expect(isHidden()).toBe(true);

    toggleSwitch();
    expect(isHidden()).toBe(false);
  });

  it('uploads in replace mode in one click when the delete toggle is on', async () => {
    renderModal();

    selectFile();
    toggleSwitch();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(mockedSendPostRequest).toHaveBeenCalled());
    expect(mockedSendPostRequest.mock.calls[0][0]).toContain('mode=replace');
  });

  it('shows the error under the file and disables Upload and the toggle', async () => {
    rejectUpload({
      message: 'Bad header row.',
      problems: [],
      truncated: false,
    });
    renderModal();

    selectFile();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(await screen.findByText('Bad header row.')).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: 'Upload' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (document.getElementById(SWITCH_ID) as HTMLInputElement).disabled,
    ).toBe(true);
  });

  it('lists every reported problem and notes truncation', async () => {
    rejectUpload({
      message: 'Rejected.',
      problems: [
        { message: 'Duplicate dataset.', row: 3, field: 'Dataset ID' },
        { message: 'Missing value.', row: 7 },
      ],
      truncated: true,
    });
    renderModal();

    selectFile();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(
      await screen.findByText('Row 3, Dataset ID: Duplicate dataset.'),
    ).toBeTruthy();
    expect(screen.getByText('Row 7: Missing value.')).toBeTruthy();
    expect(screen.getByText(/only the first 2 problems/i)).toBeTruthy();
  });

  it('clears the error and re-enables Upload when another file is chosen', async () => {
    rejectUpload({
      message: 'Bad header row.',
      problems: [],
      truncated: false,
    });
    renderModal();

    selectFile();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    await screen.findByText('Bad header row.');

    selectFile();

    expect(screen.queryByText('Bad header row.')).toBeNull();
    expect(
      (screen.getByRole('button', { name: 'Upload' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
});
