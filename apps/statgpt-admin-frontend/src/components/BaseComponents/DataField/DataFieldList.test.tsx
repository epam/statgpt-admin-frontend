/** @jest-environment jsdom */
/* global describe, it, expect */
import { render, screen } from '@testing-library/react';

import { DataFieldList } from './DataFieldList';

describe('DataFieldList', () => {
  it('renders a bulleted list when the value has multiple ;-separated segments', () => {
    render(
      <DataFieldList
        label="Indicators Coverage"
        value="GDP; CPI; Unemployment rate"
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'GDP',
      'CPI',
      'Unemployment rate',
    ]);
  });

  it('falls back to plain text when the value has no delimiter', () => {
    render(<DataFieldList label="Indicators Coverage" value="GDP only" />);

    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByText('GDP only')).not.toBeNull();
  });

  it('falls back to plain text for an empty value', () => {
    render(<DataFieldList label="Missing Indicators" value="" />);

    expect(screen.queryByRole('list')).toBeNull();
    expect(
      screen.getByText('Missing Indicators').nextSibling?.textContent,
    ).toBe('');
  });

  it('drops empty segments from malformed input instead of rendering blank items', () => {
    render(<DataFieldList label="Reference Area" value="USA;; Canada; " />);

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['USA', 'Canada']);
  });

  it('falls back to plain text when malformed input has only one real segment', () => {
    render(<DataFieldList label="Frequency Coverage" value="Monthly;;  ; " />);

    expect(screen.queryByRole('list')).toBeNull();
    expect(
      screen.getByText('Frequency Coverage').nextSibling?.textContent,
    ).toBe('Monthly;;  ; ');
  });
});
