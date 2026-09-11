/** @jest-environment jsdom */
/* global describe, it, expect, jest */
import { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { FeatureFlagsProvider } from '@/src/context/FeatureFlagsContext';
import { ImportChannelModal } from './ImportChannelModal';

jest.mock('@/src/components/BaseComponents/LoadFileArea/LoadFileArea', () => ({
  __esModule: true,
  default: ({ onChangeFile }: { onChangeFile: (files?: FileList) => void }) => (
    <button
      onClick={() =>
        onChangeFile([new File([], 'test.csv')] as unknown as FileList)
      }
    >
      select file
    </button>
  ),
}));

type UploadFile = ComponentProps<typeof ImportChannelModal>['uploadFile'];

const renderModal = (
  discoveryDatasets: boolean,
  uploadFile: UploadFile = () => {},
) =>
  render(
    <FeatureFlagsProvider flags={{ discoveryDatasets }}>
      <ImportChannelModal close={() => {}} uploadFile={uploadFile} />
    </FeatureFlagsProvider>,
  );

const toggleSwitch = (switchId: string): void => {
  fireEvent.click(document.getElementById(switchId) as HTMLInputElement);
};

describe('ImportChannelModal', () => {
  describe('when Grade C datasets are disabled', () => {
    it('does not render the discovery datasets replace switch', () => {
      renderModal(false);

      expect(screen.queryByText('Replace Grade C datasets')).toBeNull();
    });

    it('still renders the glossary terms replace switch', () => {
      renderModal(false);

      expect(screen.getByText('Replace glossary terms')).toBeTruthy();
    });
  });

  describe('when Grade C datasets are enabled', () => {
    it('renders the discovery datasets replace switch', () => {
      renderModal(true);

      expect(screen.getByText('Replace Grade C datasets')).toBeTruthy();
    });
  });

  describe('confirm step', () => {
    it('submits immediately when neither replace switch is on', () => {
      const uploadFile = jest.fn();
      renderModal(false, uploadFile);

      fireEvent.click(screen.getByRole('button', { name: 'select file' }));
      fireEvent.click(screen.getByRole('button', { name: 'Import' }));

      expect(uploadFile).toHaveBeenCalled();
      expect(screen.queryByText(/permanently delete/i)).toBeNull();
    });

    it('shows what will be deleted instead of submitting when a replace switch is on', () => {
      const uploadFile = jest.fn();
      renderModal(false, uploadFile);

      toggleSwitch('replaceGlossaryTerms');
      fireEvent.click(screen.getByRole('button', { name: 'select file' }));
      fireEvent.click(screen.getByRole('button', { name: 'Import' }));

      expect(screen.getByText(/permanently delete/i)).toBeTruthy();
      expect(
        screen.getByText('Glossary terms not in this archive'),
      ).toBeTruthy();
      expect(uploadFile).not.toHaveBeenCalled();
    });

    it('submits after Confirm Import is clicked', () => {
      const uploadFile = jest.fn();
      renderModal(false, uploadFile);

      toggleSwitch('replaceGlossaryTerms');
      fireEvent.click(screen.getByRole('button', { name: 'select file' }));
      fireEvent.click(screen.getByRole('button', { name: 'Import' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm Import' }));

      expect(uploadFile).toHaveBeenCalled();
    });

    it('returns to the select step on Back without submitting', () => {
      const uploadFile = jest.fn();
      renderModal(false, uploadFile);

      toggleSwitch('replaceGlossaryTerms');
      fireEvent.click(screen.getByRole('button', { name: 'select file' }));
      fireEvent.click(screen.getByRole('button', { name: 'Import' }));
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.getByRole('button', { name: 'Import' })).toBeTruthy();
      expect(uploadFile).not.toHaveBeenCalled();
    });
  });
});
