'use client';

import { FC } from 'react';

import { DataField } from '@/src/components/BaseComponents/DataField/DataField';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { Modal } from '@/src/components/Modal/Modal';
import {
  DISCOVERY_INDEXING_STATUS_LABEL,
  DISCOVERY_VALIDATION_STATUS_LABEL,
  DiscoveryDataset,
  formatDiscoveryValidationIssues,
} from '@/src/models/discovery-dataset';

interface Props {
  data: DiscoveryDataset;
  close: () => void;
}

export const DiscoveryDatasetDetailsView: FC<Props> = ({ data, close }) => {
  return (
    <Modal title="Discovery Dataset Details" close={close} width="700px">
      <></>

      <div className="flex flex-col gap-y-4 p-4 max-h-[70vh] overflow-auto">
        <DataField label="ID" value={String(data.id)} />
        <DataField label="Agency" value={data.agency} />
        <DataField label="Dataset ID" value={data.datasetId} />
        <DataField label="Name" value={data.name} />
        <DataField label="Description" value={data.description} />
        <DataField label="URL" value={data.url} />
        <DataField label="Reference Area" value={data.referenceArea} />
        <DataField label="Regional Coverage" value={data.regionalCoverage} />
        <DataField
          label="Excluded Regional Values"
          value={data.excludedRegionalValues}
        />
        <DataField label="Time Coverage" value={data.timeCoverage} />
        <DataField label="Frequency Coverage" value={data.frequencyCoverage} />
        <DataField
          label="Indicators Coverage"
          value={data.indicatorsCoverage}
        />
        <DataField label="Missing Indicators" value={data.missingIndicators} />
        <DataField label="Channel ID" value={String(data.channelId ?? '')} />
        <DataField
          label="Validation Status"
          value={
            data.validationStatus &&
            DISCOVERY_VALIDATION_STATUS_LABEL[data.validationStatus]
          }
        />
        <DataField
          label="Validation Issues"
          value={formatDiscoveryValidationIssues(data.validationIssues)}
        />
        <DataField label="Validated At" value={data.validatedAt} />
        <DataField
          label="Indexing Status"
          value={
            data.indexingStatus &&
            DISCOVERY_INDEXING_STATUS_LABEL[data.indexingStatus]
          }
        />
        <DataField label="Indexed At" value={data.indexedAt} />
        <DataField label="Index Error" value={data.indexError} />
      </div>

      <div className="flex flex-row justify-end">
        <Button cssClass="primary" title="Close" onClick={close} />
      </div>
    </Modal>
  );
};
