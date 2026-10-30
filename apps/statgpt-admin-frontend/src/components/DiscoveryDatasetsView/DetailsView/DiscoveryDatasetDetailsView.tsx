'use client';

import { FC } from 'react';

import { DataField } from '@/src/components/BaseComponents/DataField/DataField';
import { DataFieldList } from '@/src/components/BaseComponents/DataField/DataFieldList';
import { Button } from '@/src/components/BaseComponents/Button/Button';
import { Modal } from '@/src/components/Modal/Modal';
import {
  DISCOVERY_INDEXING_STATUS_LABEL,
  DISCOVERY_VALIDATION_STATUS_LABEL,
  DiscoveryDataset,
  formatDiscoveryValidationIssues,
} from '@/src/models/discovery-dataset';

const EMPTY_TEXT = 'n/a';

interface Props {
  data: DiscoveryDataset;
  close: () => void;
}

export const DiscoveryDatasetDetailsView: FC<Props> = ({ data, close }) => {
  const hasMissingIndicators = !!data.missingIndicators
    ?.split(';')
    .some((item) => item.trim());

  return (
    <Modal title="Grade C Dataset Details" close={close} width="700px">
      <></>

      <div className="flex flex-col gap-y-4 p-4 max-h-[70vh] overflow-auto">
        <DataField label="ID" value={String(data.id)} emptyText={EMPTY_TEXT} />
        <DataField label="Agency" value={data.agency} emptyText={EMPTY_TEXT} />
        <DataField
          label="Dataset ID"
          value={data.datasetId}
          emptyText={EMPTY_TEXT}
        />
        <DataField label="Name" value={data.name} emptyText={EMPTY_TEXT} />
        <DataField
          label="Description"
          value={data.description}
          emptyText={EMPTY_TEXT}
        />
        <DataField label="URL" value={data.url} emptyText={EMPTY_TEXT} />
        <DataFieldList
          label="Reference Area"
          value={data.referenceArea}
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Regional Coverage"
          value={data.regionalCoverage}
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Time Coverage"
          value={data.timeCoverage}
          emptyText={EMPTY_TEXT}
        />
        <DataFieldList
          label="Frequency Coverage"
          value={data.frequencyCoverage}
          emptyText={EMPTY_TEXT}
        />
        <DataFieldList
          label="Indicators Coverage"
          value={data.indicatorsCoverage}
          emptyText={EMPTY_TEXT}
        />
        <DataFieldList
          label="Published Indicators"
          value={data.indicatorsSummary}
          emptyText={EMPTY_TEXT}
        />
        {hasMissingIndicators && (
          <DataFieldList
            label="Missing Indicators"
            value={data.missingIndicators}
            emptyText={EMPTY_TEXT}
          />
        )}
        <DataField
          label="Channel ID"
          value={String(data.channelId ?? '')}
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Validation Status"
          value={
            data.validationStatus &&
            DISCOVERY_VALIDATION_STATUS_LABEL[data.validationStatus]
          }
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Validation Issues"
          value={formatDiscoveryValidationIssues(data.validationIssues)}
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Validated At"
          value={data.validatedAt}
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Indexing Status"
          value={
            data.indexingStatus &&
            DISCOVERY_INDEXING_STATUS_LABEL[data.indexingStatus]
          }
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Indexed At"
          value={data.indexedAt}
          emptyText={EMPTY_TEXT}
        />
        <DataField
          label="Index Error"
          value={data.indexError}
          emptyText={EMPTY_TEXT}
        />
      </div>

      <div className="flex flex-row justify-end">
        <Button cssClass="primary" title="Close" onClick={close} />
      </div>
    </Modal>
  );
};
