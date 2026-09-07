/** @jest-environment jsdom */
/* global describe, it, expect, jest */
import { render, screen, fireEvent } from '@testing-library/react';

import { Tabs } from './Tabs';

const TABS = [
  { key: 'grade-a', label: 'Grade A datasets' },
  { key: 'grade-c', label: 'Grade C datasets' },
];

describe('Tabs', () => {
  it('renders a tab button per item and marks the active one', () => {
    render(<Tabs tabs={TABS} activeKey="grade-a" onChange={jest.fn()} />);

    const gradeA = screen.getByRole('tab', { name: 'Grade A datasets' });
    const gradeC = screen.getByRole('tab', { name: 'Grade C datasets' });

    expect(gradeA.getAttribute('aria-selected')).toBe('true');
    expect(gradeC.getAttribute('aria-selected')).toBe('false');
  });

  it('calls onChange with the clicked tab key', () => {
    const onChange = jest.fn();
    render(<Tabs tabs={TABS} activeKey="grade-a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Grade C datasets' }));

    expect(onChange).toHaveBeenCalledWith('grade-c');
  });

  it('does not call onChange when clicking the already-active tab', () => {
    const onChange = jest.fn();
    render(<Tabs tabs={TABS} activeKey="grade-a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Grade A datasets' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('only puts the active tab in the page tab order', () => {
    render(<Tabs tabs={TABS} activeKey="grade-a" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Grade A datasets' }).tabIndex).toBe(
      0,
    );
    expect(screen.getByRole('tab', { name: 'Grade C datasets' }).tabIndex).toBe(
      -1,
    );
  });

  it('moves selection to the next tab on ArrowRight and wraps at the end', () => {
    const onChange = jest.fn();
    render(<Tabs tabs={TABS} activeKey="grade-c" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('grade-a');
  });

  it('moves selection to the previous tab on ArrowLeft and wraps at the start', () => {
    const onChange = jest.fn();
    render(<Tabs tabs={TABS} activeKey="grade-a" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });

    expect(onChange).toHaveBeenCalledWith('grade-c');
  });
});
