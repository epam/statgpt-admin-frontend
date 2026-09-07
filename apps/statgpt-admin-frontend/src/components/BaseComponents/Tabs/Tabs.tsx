import { KeyboardEvent, useCallback, useRef } from 'react';

import { mergeClasses } from '@/src/utils/mergeClasses';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
}

const NAVIGATION_KEYS = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];

/**
 * Follows the ARIA tabs pattern with automatic activation: only the active
 * tab sits in the page tab order, and the arrow/Home/End keys move both
 * focus and selection among the rest, wrapping at the ends.
 */
export function Tabs<T extends string>({
  tabs,
  activeKey,
  onChange,
  ariaLabel,
}: Props<T>) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!NAVIGATION_KEYS.includes(event.key) || tabs.length === 0) return;

      const activeIndex = Math.max(
        tabs.findIndex((tab) => tab.key === activeKey),
        0,
      );
      const lastIndex = tabs.length - 1;

      let nextIndex = activeIndex;
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
          break;
        case 'ArrowLeft':
          nextIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = lastIndex;
          break;
      }

      event.preventDefault();

      const nextTab = tabs[nextIndex];
      tabRefs.current[nextTab.key]?.focus();
      if (nextTab.key !== activeKey) {
        onChange(nextTab.key);
      }
    },
    [tabs, activeKey, onChange],
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className="flex flex-row gap-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            ref={(element) => {
              tabRefs.current[tab.key] = element;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => {
              if (!isActive) onChange(tab.key);
            }}
            className={mergeClasses(
              'small flex h-[38px] cursor-pointer items-center rounded border-b-2 border-solid bg-layer-4 px-4 text-primary transition-colors',
              isActive
                ? 'border-accent-primary bg-accent-primary-alpha'
                : 'border-transparent',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
