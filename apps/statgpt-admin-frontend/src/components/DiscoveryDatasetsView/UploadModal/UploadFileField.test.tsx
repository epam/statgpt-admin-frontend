/** @jest-environment jsdom */
/* global describe, it, expect, jest */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';

import {
  getFileListHeight,
  MAX_VISIBLE_FILE_ROWS,
  UploadFileField,
} from './UploadFileField';

jest.mock('@/src/components/BaseComponents/LoadFileArea/LoadFileArea', () => ({
  __esModule: true,
  LoadFileArea: ({
    onChangeFile,
  }: {
    onChangeFile: (files?: FileList) => void;
  }) => (
    <>
      <button
        onClick={() =>
          onChangeFile([
            new File([], 'dropped.csv'),
            new File([], 'dropped2.xlsx'),
          ] as unknown as FileList)
        }
      >
        drop area
      </button>
      <button onClick={() => onChangeFile(void 0)}>drop nothing</button>
    </>
  ),
}));

const renderField = (
  props: Partial<ComponentProps<typeof UploadFileField>> = {},
) =>
  render(
    <UploadFileField
      files={[]}
      acceptTypes=".csv,.xlsx"
      onAddFiles={() => {}}
      onRemoveFile={() => {}}
      {...props}
    />,
  );

const getFileInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('UploadFileField', () => {
  it('shows the drop area while no files are chosen', () => {
    renderField();

    expect(screen.getByRole('button', { name: 'drop area' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add files' })).toBeNull();
  });

  it('passes every dropped file to onAddFiles as an array', () => {
    const onAddFiles = jest.fn();
    renderField({ onAddFiles });

    fireEvent.click(screen.getByRole('button', { name: 'drop area' }));

    expect(onAddFiles).toHaveBeenCalledTimes(1);
    const added = onAddFiles.mock.calls[0][0] as File[];
    expect(Array.isArray(added)).toBe(true);
    expect(added.map((f) => f.name)).toEqual(['dropped.csv', 'dropped2.xlsx']);
  });

  it('lists one row per chosen file and an Add files action', () => {
    renderField({
      files: [
        new File([], 'World Economic Outlook (WEO).csv'),
        new File([], 'second.xlsx'),
      ],
    });

    expect(screen.getByText('World Economic Outlook (WEO).csv')).toBeTruthy();
    expect(screen.getByText('second.xlsx')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add files' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Change file' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'drop area' })).toBeNull();
  });

  it('keeps two files with the same name as two rows', () => {
    renderField({ files: [new File([], 'a.csv'), new File([], 'a.csv')] });

    expect(screen.getAllByText('a.csv')).toHaveLength(2);
  });

  it('calls onRemoveFile with the index of the clicked row', () => {
    const onRemoveFile = jest.fn();
    renderField({
      files: [new File([], 'a.csv'), new File([], 'b.csv')],
      onRemoveFile,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove b.csv' }));

    expect(onRemoveFile).toHaveBeenCalledWith(1);
  });

  it('does not render an editable text input for the file names', () => {
    const { container } = renderField({ files: [new File([], 'data.csv')] });

    expect(container.querySelector('input[type="text"]')).toBeNull();
  });

  it('lets the file input pick several files', () => {
    const { container } = renderField({ files: [new File([], 'a.csv')] });

    expect(getFileInput(container).multiple).toBe(true);
  });

  it('passes every picked file to onAddFiles', () => {
    const onAddFiles = jest.fn();
    const { container } = renderField({
      files: [new File([], 'old.csv')],
      onAddFiles,
    });
    const first = new File([], 'new.csv');
    const second = new File([], 'new2.csv');

    fireEvent.change(getFileInput(container), {
      target: { files: [first, second] },
    });

    expect(onAddFiles).toHaveBeenCalledWith([first, second]);
  });

  it('hands over the picked files before the input is reset', () => {
    const onAddFiles = jest.fn();
    const { container } = renderField({
      files: [new File([], 'old.csv')],
      onAddFiles,
    });
    const input = getFileInput(container);
    const liveList = [new File([], 'new.csv'), new File([], 'new2.csv')];
    // Browsers empty the live `input.files` list when `value` is reset.
    Object.defineProperty(input, 'files', { get: () => liveList });
    Object.defineProperty(input, 'value', {
      set: () => {
        liveList.length = 0;
      },
    });

    fireEvent.change(input);

    expect(onAddFiles).toHaveBeenCalledTimes(1);
    expect((onAddFiles.mock.calls[0][0] as File[]).map((f) => f.name)).toEqual([
      'new.csv',
      'new2.csv',
    ]);
  });

  it('ignores a change event that carries no files', () => {
    const onAddFiles = jest.fn();
    const { container } = renderField({
      files: [new File([], 'old.csv')],
      onAddFiles,
    });

    fireEvent.change(getFileInput(container), { target: { files: [] } });

    expect(onAddFiles).not.toHaveBeenCalled();
  });

  it('links the file input to the error and flags it invalid when rejected', () => {
    const { container } = renderField({
      files: [new File([], 'bad.csv')],
      invalid: true,
      errorId: 'file-error',
    });
    const input = getFileInput(container);

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('file-error');
  });

  it('keeps the file input free of error attributes when the files are fine', () => {
    const { container } = renderField({
      files: [new File([], 'good.csv')],
      errorId: 'file-error',
    });
    const input = getFileInput(container);

    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('caps the list height at the visible maximum so longer lists scroll', () => {
    expect(getFileListHeight(1)).toBe(36);
    expect(getFileListHeight(2)).toBe(76);
    expect(getFileListHeight(MAX_VISIBLE_FILE_ROWS + 5)).toBe(
      getFileListHeight(MAX_VISIBLE_FILE_ROWS),
    );
  });

  it('gives the list a scroll area capped at the visible maximum', () => {
    const { container } = renderField({
      files: Array.from({ length: 8 }, (_, i) => new File([], `f${i}.csv`)),
    });

    const list = container.querySelector('ul') as HTMLElement;
    expect(list.style.maxHeight).toBe(
      `${getFileListHeight(MAX_VISIBLE_FILE_ROWS)}px`,
    );
  });

  it('ignores a drop that carries no files', () => {
    const onAddFiles = jest.fn();
    renderField({ onAddFiles });

    fireEvent.click(screen.getByRole('button', { name: 'drop nothing' }));

    expect(onAddFiles).not.toHaveBeenCalled();
  });
});
