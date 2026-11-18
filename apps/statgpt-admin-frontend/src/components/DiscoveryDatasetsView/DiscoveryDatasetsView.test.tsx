/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach, afterEach */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { NotificationType } from '@/src/models/notification';
import { sendDeleteRequest, sendGetRequest } from '@/src/server/api';
import { DiscoveryDatasetsView } from './DiscoveryDatasetsView';

const mockShowNotification = jest.fn();
const mockRemoveNotification = jest.fn();

jest.mock('@/src/context/NotificationContext', () => ({
  useNotification: () => ({
    showNotification: mockShowNotification,
    removeNotification: mockRemoveNotification,
  }),
}));

jest.mock('@/src/context/AccessControlContext', () => ({
  useAccessControl: () => ({ setForbidden: jest.fn() }),
}));

jest.mock('@/src/context/NavigationLoadingContext', () => ({
  usePageInitialLoadingSync: jest.fn(),
}));

jest.mock('@/src/server/api', () => ({
  sendGetRequest: jest.fn(),
  sendDeleteRequest: jest.fn(),
}));

jest.mock('./useDiscoveryIndexingJobPolling', () => ({
  useDiscoveryIndexingJobPolling: () => ({
    triggerReindex: jest.fn(),
    isReindexInProgress: false,
  }),
}));

jest.mock('./UploadModal/UploadModal', () => ({ UploadModal: () => null }));
jest.mock('./ExportModal/ExportModal', () => ({
  ExportModal: ({
    close,
    onExport,
  }: {
    close: () => void;
    onExport: (options: { format: string; includeValidation: boolean }) => void;
  }) => (
    <button
      onClick={() => {
        onExport({ format: 'csv', includeValidation: false });
        close();
      }}
    >
      confirm export
    </button>
  ),
}));
jest.mock('./ReindexConfirmDialog/ReindexConfirmDialog', () => ({
  ReindexConfirmDialog: () => null,
}));

jest.mock('@/src/constants/columns/discovery-datasets', () => ({
  getDiscoveryDatasetsFilterValues: () => ({}),
  getDiscoveryDatasetsColumns: (deleteRow: (id: number) => void) => ({
    deleteRow,
  }),
}));

jest.mock('@/src/components/GridView/GridView', () => ({
  GridView: ({
    colDefs,
    additionalOptions,
    fetchRows,
  }: {
    colDefs: { deleteRow: (id: number) => void };
    additionalOptions: {
      onRowSelected: (event: unknown) => void;
    };
    fetchRows: (args: {
      offset: number;
      limit: number;
      filterModel: unknown;
    }) => Promise<unknown>;
  }) => (
    <div>
      <button
        onClick={() =>
          fetchRows({
            offset: 0,
            limit: 100,
            filterModel: {
              agency: { value: 'WB' },
              validationStatus: { value: 'INVALID' },
              indexingStatus: { value: 'NEW' },
            },
          })
        }
      >
        apply filters
      </button>
      <button
        onClick={() =>
          additionalOptions.onRowSelected({
            api: {
              getSelectedNodes: () =>
                Array.from({ length: 501 }, (_, i) => ({
                  data: { id: i + 1 },
                })),
            },
          })
        }
      >
        select 501 rows
      </button>
      <button
        onClick={() =>
          additionalOptions.onRowSelected({
            api: {
              getSelectedNodes: () => [
                { data: { id: 1 } },
                { data: { id: 2 } },
              ],
            },
          })
        }
      >
        select rows
      </button>
      <button
        onClick={() =>
          additionalOptions.onRowSelected({
            api: { getSelectedNodes: () => [] },
          })
        }
      >
        clear selection
      </button>
      <button onClick={() => colDefs.deleteRow(7)}>delete row</button>
    </div>
  ),
}));

jest.mock(
  '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog',
  () => ({
    ConfirmDialog: ({
      modalState,
      confirmLabel,
      onClose,
    }: {
      modalState: string;
      confirmLabel: string;
      onClose: (confirmed: boolean) => void;
    }) =>
      modalState === 'Opened' ? (
        <button onClick={() => onClose(true)}>confirm {confirmLabel}</button>
      ) : null,
  }),
);

const mockedGet = sendGetRequest as jest.Mock;
const mockedDelete = sendDeleteRequest as jest.Mock;

const STATS = {
  total: 5,
  byValidationStatus: {},
  byIndexingStatus: {},
  byAgency: {},
};

const LOADING_ID = 'loading-toast-id';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const clearAllButton = () => screen.getByRole('button', { name: 'Clear all' });

const renderView = async () => {
  render(<DiscoveryDatasetsView selectedChannelId="42" />);
  await waitFor(() =>
    expect((clearAllButton() as HTMLButtonElement).disabled).toBe(false),
  );
};

const loadingToastCalls = () =>
  mockShowNotification.mock.calls.filter(
    ([notification]) => notification.type === NotificationType.loading,
  );

describe('DiscoveryDatasetsView delete progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue({ ok: true, data: STATS });
    mockShowNotification.mockImplementation(({ type }) =>
      type === NotificationType.loading ? LOADING_ID : 'other-toast-id',
    );
  });

  it('shows a persistent loading toast while all records are being cleared', async () => {
    const request = deferred<unknown>();
    mockedDelete.mockReturnValue(request.promise);
    await renderView();

    fireEvent.click(clearAllButton());
    fireEvent.click(screen.getByText('confirm Clear all'));

    expect(loadingToastCalls()).toEqual([
      [
        {
          type: NotificationType.loading,
          title: 'Clearing Grade C datasets',
          description:
            'Deleting all Grade C dataset records for this channel. This may take a few seconds.',
          duration: null,
        },
      ],
    ]);
    expect(mockRemoveNotification).not.toHaveBeenCalled();

    await act(async () => {
      request.resolve({ ok: true, data: '[{}, {}]' });
    });
  });

  it('replaces the loading toast with the success toast once clearing finishes', async () => {
    mockedDelete.mockResolvedValue({ ok: true, data: '[{}, {}]' });
    await renderView();

    fireEvent.click(clearAllButton());
    fireEvent.click(screen.getByText('confirm Clear all'));

    await waitFor(() =>
      expect(mockRemoveNotification).toHaveBeenCalledWith(LOADING_ID),
    );
    expect(mockShowNotification).toHaveBeenLastCalledWith({
      type: NotificationType.success,
      title: 'Grade C Dataset Records Deleted',
      description: 'Deleted 2 Grade C dataset records',
    });
  });

  it('removes the loading toast when clearing fails', async () => {
    mockedDelete.mockResolvedValue({
      ok: false,
      error: { status: 500, message: 'boom' },
    });
    await renderView();

    fireEvent.click(clearAllButton());
    fireEvent.click(screen.getByText('confirm Clear all'));

    await waitFor(() =>
      expect(mockRemoveNotification).toHaveBeenCalledWith(LOADING_ID),
    );
    expect(mockShowNotification).toHaveBeenLastCalledWith({
      type: NotificationType.error,
      title: 'Failed to Clear Grade C Datasets',
      description: 'boom',
    });
  });

  it('shows a loading toast while the selected records are being deleted', async () => {
    mockedDelete.mockResolvedValue({ ok: true, data: '[{}, {}]' });
    await renderView();

    fireEvent.click(screen.getByText('select rows'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete selected (2)' }),
    );
    fireEvent.click(screen.getByText('confirm Delete'));

    expect(loadingToastCalls()).toEqual([
      [
        {
          type: NotificationType.loading,
          title: 'Deleting selected Grade C datasets',
          description: 'Deleting 2 selected Grade C dataset records.',
          duration: null,
        },
      ],
    ]);
    await waitFor(() =>
      expect(mockRemoveNotification).toHaveBeenCalledWith(LOADING_ID),
    );
  });

  it('shows a loading toast while a single record is being deleted', async () => {
    mockedDelete.mockResolvedValue({ ok: true, data: '{}' });
    await renderView();

    fireEvent.click(screen.getByText('delete row'));

    expect(loadingToastCalls()).toEqual([
      [
        {
          type: NotificationType.loading,
          title: 'Deleting Grade C dataset',
          description: 'Deleting 1 Grade C dataset record.',
          duration: null,
        },
      ],
    ]);
    await waitFor(() =>
      expect(mockRemoveNotification).toHaveBeenCalledWith(LOADING_ID),
    );
  });

  it('disables Reindex while rows are selected and re-enables it when selection is cleared', async () => {
    await renderView();
    const reindexButton = () =>
      screen.getByRole('button', { name: 'Reindex' }) as HTMLButtonElement;

    expect(reindexButton().disabled).toBe(false);

    fireEvent.click(screen.getByText('select rows'));
    expect(reindexButton().disabled).toBe(true);

    fireEvent.click(screen.getByText('clear selection'));
    expect(reindexButton().disabled).toBe(false);
  });
});

describe('DiscoveryDatasetsView export', () => {
  const EXPORT_PATH = '/api/v1/channels/42/discovery-datasets/export';
  let windowOpen: jest.SpyInstance;

  const exportButton = (name: string | RegExp) =>
    screen.getByRole('button', { name }) as HTMLButtonElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue({ ok: true, data: STATS });
    windowOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => windowOpen.mockRestore());

  it('is labelled "Export datasets" without a selection and counts the selected rows otherwise', async () => {
    await renderView();
    expect(exportButton('Export datasets')).toBeTruthy();

    fireEvent.click(screen.getByText('select rows'));
    expect(exportButton('Export selected (2)')).toBeTruthy();

    fireEvent.click(screen.getByText('clear selection'));
    expect(exportButton('Export datasets')).toBeTruthy();
  });

  it('opens the export modal instead of downloading right away', async () => {
    await renderView();

    fireEvent.click(exportButton('Export datasets'));

    expect(screen.getByText('confirm export')).toBeTruthy();
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it('downloads the chosen format with the active grid filters when nothing is selected', async () => {
    await renderView();
    fireEvent.click(screen.getByText('apply filters'));

    fireEvent.click(exportButton('Export datasets'));
    fireEvent.click(screen.getByText('confirm export'));

    expect(windowOpen).toHaveBeenCalledTimes(1);
    expect(windowOpen).toHaveBeenCalledWith(
      `${EXPORT_PATH}?format=csv&include_validation=false&agency=WB&validation_status=INVALID&indexing_status=NEW`,
      '_blank',
      'noopener',
    );
    expect(screen.queryByText('confirm export')).toBeNull();
  });

  it('downloads exactly the selected rows by id and sends no filters', async () => {
    await renderView();
    fireEvent.click(screen.getByText('apply filters'));
    fireEvent.click(screen.getByText('select rows'));

    fireEvent.click(exportButton('Export selected (2)'));
    fireEvent.click(screen.getByText('confirm export'));

    expect(windowOpen).toHaveBeenCalledWith(
      `${EXPORT_PATH}?format=csv&include_validation=false&id=1&id=2`,
      '_blank',
      'noopener',
    );
  });

  it('disables the export for more than 500 selected rows and explains the limit', async () => {
    await renderView();

    fireEvent.click(screen.getByText('select 501 rows'));

    const button = exportButton('Export selected (501)');
    expect(button.disabled).toBe(true);
    fireEvent.mouseEnter(button.parentElement as HTMLElement);
    expect(
      screen.getByText(
        'At most 500 selected datasets can be exported. Deselect some rows to export.',
      ),
    ).toBeTruthy();
  });
});
