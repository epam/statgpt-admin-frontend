'use client';

import { FC, useState } from 'react';

import { Button } from '@/src/components/BaseComponents/Button/Button';
import Checkbox from '@/src/components/BaseComponents/Checkbox/Checkbox';
import DropdownField from '@/src/components/BaseComponents/DropdownField/DropdownField';
import { Modal } from '@/src/components/Modal/Modal';
import { DiscoveryExportFormat } from '@/src/models/discovery-dataset';

export interface ExportOptions {
  format: DiscoveryExportFormat;
  includeValidation: boolean;
}

interface Props {
  close: () => void;
  onExport: (options: ExportOptions) => void;
}

const FORMAT_FIELD_ID = 'export-format';
const VALIDATION_CHECKBOX_ID = 'export-include-validation';

const FORMAT_ITEMS = [
  { id: DiscoveryExportFormat.Excel, name: 'Excel (.xlsx)' },
  { id: DiscoveryExportFormat.Csv, name: 'CSV (.csv)' },
];

export const ExportModal: FC<Props> = ({ close, onExport }) => {
  const [format, setFormat] = useState(DiscoveryExportFormat.Excel);
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [includeValidation, setIncludeValidation] = useState(true);

  const submit = () => {
    onExport({ format, includeValidation });
    close();
  };

  return (
    <Modal title="Export Grade C datasets" close={close} width="500px">
      <></>

      <div className="flex flex-col gap-y-4 px-6 pt-4 pb-4">
        <div className="flex flex-col gap-y-2">
          <DropdownField
            fieldTitle="Format"
            elementId={FORMAT_FIELD_ID}
            items={FORMAT_ITEMS}
            selectedValue={format}
            isMenuOpen={isFormatOpen}
            onOpenChange={setIsFormatOpen}
            onChange={(value) => {
              setFormat(value as DiscoveryExportFormat);
              setIsFormatOpen(false);
            }}
          />
          <p className="small text-secondary">
            Excel matches the upload template and highlights the cells with
            issues. CSV is a plain file.
          </p>
        </div>

        <div className="flex flex-col gap-y-2">
          <Checkbox
            id={VALIDATION_CHECKBOX_ID}
            label="Include validation statuses"
            checked={includeValidation}
            onChange={(value) => setIncludeValidation(!!value)}
          />
          <p className="small text-secondary">
            Adds the validation status, time and issues columns.
          </p>
        </div>
      </div>

      <div className="flex flex-row justify-end">
        <Button cssClass="secondary mr-3" title="Cancel" onClick={close} />
        <Button cssClass="primary" title="Export" onClick={submit} />
      </div>
    </Modal>
  );
};
