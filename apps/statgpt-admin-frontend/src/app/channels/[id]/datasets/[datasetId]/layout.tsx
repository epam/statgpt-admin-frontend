import { ReactNode } from 'react';

import { DatasetDataProvider } from '@/src/context/DatasetDataContext';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string; datasetId: string }>;
}) {
  const { id, datasetId } = await params;
  return (
    <DatasetDataProvider channelId={id} datasetId={datasetId}>
      {children}
    </DatasetDataProvider>
  );
}
