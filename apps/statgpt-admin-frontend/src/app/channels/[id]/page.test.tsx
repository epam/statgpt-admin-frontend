/** @jest-environment jsdom */
/* global describe, it, expect, jest, beforeEach */
import { render, screen } from '@testing-library/react';

import { FeatureFlagsProvider } from '@/src/context/FeatureFlagsContext';
import Page from './page';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '42' }),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/channels/42',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/src/context/BreadcrumbContext', () => ({
  useSetBreadcrumbs: jest.fn(),
}));

jest.mock('@/src/context/NavigationLoadingContext', () => ({
  usePageInitialLoadingSync: jest.fn(),
}));

jest.mock('@/src/context/ChannelDataContext', () => ({
  useChannelData: () => ({
    channel: { id: '42', title: 'Test channel' },
    isLoading: false,
  }),
}));

jest.mock('@/src/components/ChannelView/Datasets/Datasets', () => ({
  DataSetsView: () => <div>grade a content</div>,
}));

jest.mock(
  '@/src/components/DiscoveryDatasetsView/DiscoveryDatasetsView',
  () => ({
    DiscoveryDatasetsView: () => <div>grade c content</div>,
  }),
);

const renderPage = (discoveryDatasets: boolean) =>
  render(
    <FeatureFlagsProvider flags={{ discoveryDatasets }}>
      <Page />
    </FeatureFlagsProvider>,
  );

describe('channel page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when Grade C datasets are disabled', () => {
    it('renders no tabs', () => {
      renderPage(false);

      expect(screen.queryAllByRole('tab')).toHaveLength(0);
      expect(screen.queryByRole('tablist')).toBeNull();
    });

    it('renders the Grade A datasets view without the Grade C view', () => {
      renderPage(false);

      expect(screen.getByText('grade a content')).toBeTruthy();
      expect(screen.queryByText('grade c content')).toBeNull();
    });
  });

  describe('when Grade C datasets are enabled', () => {
    it('renders a tab for each dataset grade', () => {
      renderPage(true);

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        'Grade A datasets',
        'Grade C datasets',
      ]);
    });

    it('renders the Grade A datasets view on the default tab', () => {
      renderPage(true);

      expect(screen.getByText('grade a content')).toBeTruthy();
    });
  });
});
