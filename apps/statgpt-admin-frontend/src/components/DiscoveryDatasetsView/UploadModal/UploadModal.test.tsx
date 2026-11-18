/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { sendPostRequest } from '@/src/server/api';
import { UploadModal } from './UploadModal';

jest.mock('@/src/components/BaseComponents/LoadFileArea/LoadFileArea', () => ({
  __esModule: true,
  LoadFileArea: ({
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

const addFiles = (...names: string[]): void => {
  fireEvent.change(
    document.querySelector('input[type="file"]') as HTMLInputElement,
    { target: { files: names.map((name) => new File([], name)) } },
  );
};

const getUploadButton = () =>
  screen.getByRole('button', { name: 'Upload' }) as HTMLButtonElement;

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
        files: [],
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

  it('keeps the form mounted but inert under the loader while uploading, so the modal does not resize', async () => {
    let finishUpload: (value: unknown) => void = () => {};
    mockedSendPostRequest.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );
    renderModal();

    selectFile();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    const form = document.getElementById(SWITCH_ID)?.closest('[inert]');
    expect(screen.getByRole('status', { name: 'Uploading' })).toBeTruthy();
    expect(form?.getAttribute('aria-hidden')).toBe('true');
    expect(form?.className).toContain('invisible');
    expect(
      (screen.getByRole('button', { name: 'Upload' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    finishUpload({
      ok: true,
      data: {
        created: 0,
        updated: 0,
        unchanged: 0,
        deleted: 0,
        rowsRead: 0,
        files: [],
      },
    });
    await waitFor(() => expect(screen.getByText(/completed/i)).toBeTruthy());
    expect(screen.queryByRole('status')).toBeNull();
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

    fireEvent.change(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      { target: { files: [new File([], 'fixed.csv')] } },
    );
    expect(screen.queryByText('Bad header row.')).toBeNull();
    expect(screen.getByText('fixed.csv')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'select file' })).toBeNull();
    expect(
      (screen.getByRole('button', { name: 'Upload' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });

  it('turns the delete toggle off on a rejected file and leaves it usable after choosing another file', async () => {
    rejectUpload({
      message: 'Bad header row.',
      problems: [],
      truncated: false,
    });
    renderModal();
    const getToggle = () =>
      document.getElementById(SWITCH_ID) as HTMLInputElement;

    selectFile();
    toggleSwitch();
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    await screen.findByText('Bad header row.');

    expect(getToggle().checked).toBe(false);
    expect(getToggle().disabled).toBe(true);

    fireEvent.change(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      { target: { files: [new File([], 'fixed.csv')] } },
    );

    expect(getToggle().checked).toBe(false);
    expect(getToggle().disabled).toBe(false);
  });

  it('turns the delete toggle off when another file is chosen', () => {
    renderModal();

    selectFile();
    toggleSwitch();
    expect(
      (document.getElementById(SWITCH_ID) as HTMLInputElement).checked,
    ).toBe(true);

    fireEvent.change(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      { target: { files: [new File([], 'other.csv')] } },
    );

    expect(
      (document.getElementById(SWITCH_ID) as HTMLInputElement).checked,
    ).toBe(false);
  });

  it('sends every selected file as a repeated file part in one request', async () => {
    renderModal();

    selectFile();
    addFiles('second.xlsx', 'third.csv');
    fireEvent.click(getUploadButton());

    await waitFor(() => expect(mockedSendPostRequest).toHaveBeenCalledTimes(1));
    const formData = mockedSendPostRequest.mock.calls[0][1] as FormData;
    expect((formData.getAll('file') as File[]).map((f) => f.name)).toEqual([
      'test.csv',
      'second.xlsx',
      'third.csv',
    ]);
  });

  it('adds files picked later to the list instead of replacing it', () => {
    renderModal();

    selectFile();
    addFiles('second.xlsx');

    expect(screen.getByText('test.csv')).toBeTruthy();
    expect(screen.getByText('second.xlsx')).toBeTruthy();
  });

  it('removes a file from the list and uploads the rest', async () => {
    renderModal();

    selectFile();
    addFiles('second.xlsx');
    fireEvent.click(screen.getByRole('button', { name: 'Remove test.csv' }));
    fireEvent.click(getUploadButton());

    await waitFor(() => expect(mockedSendPostRequest).toHaveBeenCalled());
    const formData = mockedSendPostRequest.mock.calls[0][1] as FormData;
    expect((formData.getAll('file') as File[]).map((f) => f.name)).toEqual([
      'second.xlsx',
    ]);
  });

  it('returns to the drop area and disables Upload when the last file is removed', () => {
    renderModal();

    selectFile();
    toggleSwitch();
    fireEvent.click(screen.getByRole('button', { name: 'Remove test.csv' }));

    expect(screen.getByRole('button', { name: 'select file' })).toBeTruthy();
    expect(getUploadButton().disabled).toBe(true);
    expect(document.getElementById(SWITCH_ID)).toBeNull();
  });

  it('shows the batch summary and a rows-read line per file on success', async () => {
    mockedSendPostRequest.mockResolvedValue({
      ok: true,
      data: {
        created: 4,
        updated: 1,
        unchanged: 0,
        deleted: 0,
        rowsRead: 5,
        files: [
          { file: 'a.csv', rowsRead: 2 },
          { file: 'b.xlsx', rowsRead: 3 },
        ],
      },
    });
    renderModal();

    selectFile();
    addFiles('b.xlsx');
    fireEvent.click(getUploadButton());

    expect(await screen.findByText(/completed/i)).toBeTruthy();
    expect(screen.getByText('Created').nextSibling?.textContent).toBe('4');
    expect(screen.getByText('a.csv').nextSibling?.textContent).toBe('2');
    expect(screen.getByText('b.xlsx').nextSibling?.textContent).toBe('3');
  });

  it('prefixes each problem with the file it belongs to', async () => {
    rejectUpload({
      message: 'Rejected.',
      problems: [
        { message: 'Bad value.', file: 'a.csv', row: 3, cell: 'B3' },
        { message: 'Cannot be read.', file: 'broken.xlsx' },
      ],
      truncated: false,
    });
    renderModal();

    selectFile();
    fireEvent.click(getUploadButton());

    expect(
      await screen.findByText('a.csv, Row 3, B3: Bad value.'),
    ).toBeTruthy();
    expect(screen.getByText('broken.xlsx: Cannot be read.')).toBeTruthy();
  });

  it('shows the backend message of a refusal that has no problems', async () => {
    rejectUpload({
      message: 'Duplicate file names: a.csv.',
      problems: [],
      truncated: false,
    });
    renderModal();

    selectFile();
    addFiles('test.csv');
    fireEvent.click(getUploadButton());

    expect(
      await screen.findByText('Duplicate file names: a.csv.'),
    ).toBeTruthy();
  });

  it('words the replace switch and warning for all uploaded files', () => {
    renderModal();

    selectFile();

    expect(
      screen.getByText('Delete records not in the uploaded files'),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Records in the channel that are not in any of the uploaded files will be permanently deleted.',
      ),
    ).toBeTruthy();
  });

  it('clears the error and turns the delete toggle off when a file is removed', async () => {
    rejectUpload({
      message: 'Bad header row.',
      problems: [],
      truncated: false,
    });
    renderModal();

    selectFile();
    addFiles('second.csv');
    toggleSwitch();
    fireEvent.click(getUploadButton());
    await screen.findByText('Bad header row.');

    fireEvent.click(screen.getByRole('button', { name: 'Remove second.csv' }));

    expect(screen.queryByText('Bad header row.')).toBeNull();
    const toggle = document.getElementById(SWITCH_ID) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(false);
  });

  it('grows the modal with the files up to a cap', () => {
    renderModal();
    const getHeight = () =>
      parseInt(
        (
          screen
            .getByText('Upload Grade C Dataset')
            .closest('[style]') as HTMLElement
        ).style.height,
      );
    const empty = getHeight();

    selectFile();
    const one = getHeight();
    addFiles('b.csv', 'c.csv', 'd.csv', 'e.csv');
    const many = getHeight();
    addFiles('f.csv', 'g.csv');

    expect(one).toBeGreaterThan(0);
    expect(many).toBeGreaterThan(one);
    expect(getHeight()).toBe(many);
    expect(empty).toBeLessThanOrEqual(one + 20);
  });

  it('does not repeat the single file in a per-file breakdown on success', async () => {
    mockedSendPostRequest.mockResolvedValue({
      ok: true,
      data: {
        created: 1,
        updated: 0,
        unchanged: 0,
        deleted: 0,
        rowsRead: 1,
        files: [{ file: 'test.csv', rowsRead: 1 }],
      },
    });
    renderModal();

    selectFile();
    fireEvent.click(getUploadButton());

    expect(await screen.findByText(/completed/i)).toBeTruthy();
    expect(screen.queryByText('Rows read per file')).toBeNull();
  });

  it('shows the success summary when the backend sends no per-file list', async () => {
    mockedSendPostRequest.mockResolvedValue({
      ok: true,
      data: { created: 1, updated: 0, unchanged: 0, deleted: 0, rowsRead: 1 },
    });
    renderModal();

    selectFile();
    fireEvent.click(getUploadButton());

    expect(await screen.findByText(/completed/i)).toBeTruthy();
    expect(screen.queryByText('Rows read per file')).toBeNull();
  });

  it('clears the error and turns the delete toggle off when a file is added after a rejection', async () => {
    rejectUpload({
      message: 'Bad header row.',
      problems: [],
      truncated: false,
    });
    renderModal();

    selectFile();
    toggleSwitch();
    fireEvent.click(getUploadButton());
    await screen.findByText('Bad header row.');

    addFiles('fixed.csv');

    expect(screen.queryByText('Bad header row.')).toBeNull();
    const toggle = document.getElementById(SWITCH_ID) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(false);
  });

  it('lists a file again when it is picked once more after being removed', () => {
    renderModal();

    selectFile();
    addFiles('again.csv');
    fireEvent.click(screen.getByRole('button', { name: 'Remove again.csv' }));
    expect(screen.queryByText('again.csv')).toBeNull();

    addFiles('again.csv');

    expect(screen.getByText('again.csv')).toBeTruthy();
  });
});
