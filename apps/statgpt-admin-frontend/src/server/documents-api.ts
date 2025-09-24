import { JWT } from 'next-auth/jwt';
import {
  concatMap,
  filter,
  first,
  firstValueFrom,
  interval,
  race,
  throwError,
  timeout,
} from 'rxjs';

import { Document, DocumentMetadata } from '@/src/models/document';
import { RequestData } from '@/src/models/request-data';
import { BaseApi } from './base-api';

export const DIAL_DOCUMENTS_INDEX_LIST = `/indexing`;
export const DIAL_DOCUMENTS_LIST = `${DIAL_DOCUMENTS_INDEX_LIST}/documents`;
export const DIAL_DOCUMENTS_METADATA_LIST = `${DIAL_DOCUMENTS_LIST}/metadata`;
export const DOCUMENT_UPLOAD_URL = `${DIAL_DOCUMENTS_INDEX_LIST}/upload`;
export const DOCUMENT_TASK_URL = `${DIAL_DOCUMENTS_INDEX_LIST}/tasks`;

interface Task {
  status: TaskStatus;
  task_id: string;
}

enum TaskStatus {
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}
export class DocumentsApi extends BaseApi {
  getList(token: JWT | null): Promise<RequestData<Document> | null> {
    return this.get(`${DIAL_DOCUMENTS_LIST}?limit=2000`, token);
  }

  removeDocument(id: string): Promise<RequestData<Document> | null> {
    return this.delete(`${DIAL_DOCUMENTS_LIST}/${id}`);
  }

  getMetaData(): Promise<DocumentMetadata | null> {
    return this.get(DIAL_DOCUMENTS_METADATA_LIST);
  }

  uploadFile(formData: FormData, targetPath?: string): Promise<unknown> {
    return this.post(
      `${DOCUMENT_UPLOAD_URL}?${targetPath ? `target_path=${targetPath}&` : ''}async=${true}&use_cache=${true}`,
      formData,
      { overwrite: 'true' },
    ).then((res) => {
      const id = (res as Task).task_id;

      return firstValueFrom(this.waitForTaskReady(id).pipe()).then((res) => {
        return (res as Task).status === TaskStatus.FAILED
          ? { ok: false }
          : { ok: true };
      });
    });
  }

  private waitForTaskReady(id: string) {
    return race(interval(2000)).pipe(
      concatMap(() => {
        return this.get(`${DOCUMENT_TASK_URL}/${id}`);
      }),
      filter((res) => {
        return (
          (res as Task).status === TaskStatus.SUCCESS ||
          (res as Task).status === TaskStatus.FAILED
        );
      }),
      first(),
      timeout({
        each: 5 * 60 * 1000,
        with: () =>
          throwError(() => new Error('Timeout waiting for server status')),
      }),
    );
  }
}
