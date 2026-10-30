/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach */
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
  }: {
    colDefs: { deleteRow: (id: number) => void };
    additionalOptions: {
      onRowSelected: (event: unknown) => void;
    };
  }) => (
    <div>
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
});
