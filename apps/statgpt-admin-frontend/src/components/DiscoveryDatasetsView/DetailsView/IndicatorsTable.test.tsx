/** @jest-environment jsdom */
/* global describe, it, expect */
import { render, screen } from '@testing-library/react';

import { IndicatorsTable } from './IndicatorsTable';

const INDICATORS = [
  { name: 'GDP', units: 'USD' },
  { name: 'Inflation', units: '%' },
  { name: 'Population', units: '' },
];

describe('IndicatorsTable', () => {
  it('shows each indicator with its units and counts the ones without units', () => {
    render(
      <IndicatorsTable label="Indicators Coverage" indicators={INDICATORS} />,
    );

    expect(screen.getByText('Indicators Coverage (3)')).not.toBeNull();
    expect(screen.getByText('1 without units')).not.toBeNull();
    expect(
      screen.getByText('GDP').closest('td')?.nextSibling?.textContent,
    ).toBe('USD');
    expect(
      screen.getByText('Population').closest('td')?.nextSibling?.textContent,
    ).toBe('Units missing');
  });

  it('does not show the missing-units count when every indicator has units', () => {
    render(
      <IndicatorsTable
        label="Indicators Coverage"
        indicators={[INDICATORS[0]]}
      />,
    );

    expect(screen.queryByText(/without units/)).toBeNull();
  });

  it('shows the empty text and no table when there are no indicators', () => {
    render(
      <IndicatorsTable
        label="Indicators Coverage"
        indicators={[]}
        emptyText="n/a"
      />,
    );

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('n/a')).not.toBeNull();
  });
});
