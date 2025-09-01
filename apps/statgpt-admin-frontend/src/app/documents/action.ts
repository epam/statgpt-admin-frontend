'use server';

import { documentsApi } from '@/src/app/api/api';

export const uploadFile = async (formData: FormData, targetPath?: string) => {
  return await documentsApi.uploadFile(formData, targetPath);
};

export const getMetaData = async () => {
  return await documentsApi.getMetaData();
};

export const removeDocument = async (id: string) => {
  return await documentsApi.removeDocument(id);
};
