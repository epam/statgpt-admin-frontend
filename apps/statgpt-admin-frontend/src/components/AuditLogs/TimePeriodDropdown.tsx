'use client';

import { useMemo, useState } from 'react';
import { Button } from '../BaseComponents/Button/Button';
import Dropdown from '../BaseComponents/DropdownField/Dropdown';
import { DropdownMenuItem } from '../BaseComponents/DropdownField/DropdownItem';
import type { DropdownItemsModel } from '../BaseComponents/DropdownField/dropdown.model';
import DatePicker from '../BaseComponents/DatePicker/DatePicker';
import { AuditLogTimeRange } from '@/src/models/audit-log';
import classNames from 'classnames';

type TimeUnit = 'minute' | 'hour' | 'day' | 'month' | 'year';

type PresetId =
  | 'last_15m'
  | 'last_30m'
  | 'last_1h'
  | 'last_3h'
  | 'last_6h'
  | 'last_12h'
  | 'last_24h'
  | 'last_2d'
  | 'last_7d'
  | 'last_1mo'
  | 'last_2mo'
  | 'last_6mo'
  | 'last_1y'
  | 'last_2y';

interface Preset {
  id: PresetId;
  label: string;
  amount: number;
  unit: TimeUnit;
  sectionStart?: boolean;
  sectionEnd?: boolean;
}

const TIME_RANGE_PRESETS: readonly Preset[] = [
  { id: 'last_15m', label: 'Last 15 minutes', amount: 15, unit: 'minute' },
  { id: 'last_30m', label: 'Last 30 minutes', amount: 30, unit: 'minute' },
  { id: 'last_1h', label: 'Last 1 hour', amount: 1, unit: 'hour' },
  { id: 'last_3h', label: 'Last 3 hours', amount: 3, unit: 'hour' },
  { id: 'last_6h', label: 'Last 6 hours', amount: 6, unit: 'hour' },
  { id: 'last_12h', label: 'Last 12 hours', amount: 12, unit: 'hour' },
  { id: 'last_24h', label: 'Last 24 hours', amount: 24, unit: 'hour' },
  { id: 'last_2d', label: 'Last 2 days', amount: 2, unit: 'day' },
  {
    id: 'last_7d',
    label: 'Last 7 days',
    amount: 7,
    unit: 'day',
    sectionEnd: true,
  },
  { id: 'last_1mo', label: 'Last month', amount: 1, unit: 'month' },
  { id: 'last_2mo', label: 'Last 2 months', amount: 2, unit: 'month' },
  {
    id: 'last_6mo',
    label: 'Last 6 months',
    amount: 6,
    unit: 'month',
    sectionEnd: true,
  },
  { id: 'last_1y', label: 'Last year', amount: 1, unit: 'year' },
  { id: 'last_2y', label: 'Last 2 years', amount: 2, unit: 'year' },
];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function isoToDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
}

function sub(now: Date, amount: number, unit: TimeUnit) {
  const d = new Date(now);
  switch (unit) {
    case 'minute':
      d.setMinutes(d.getMinutes() - amount);
      break;
    case 'hour':
      d.setHours(d.getHours() - amount);
      break;
    case 'day':
      d.setDate(d.getDate() - amount);
      break;
    case 'month':
      d.setMonth(d.getMonth() - amount);
      break;
    case 'year':
      d.setFullYear(d.getFullYear() - amount);
      break;
  }
  return d;
}

function isValidRange(v: AuditLogTimeRange) {
  if (!v.created_at_from || !v.created_at_to) return true;
  return (
    new Date(v.created_at_from).getTime() <= new Date(v.created_at_to).getTime()
  );
}

function formatLabel(
  value: AuditLogTimeRange,
  activePresetLabel?: string,
): string {
  if (activePresetLabel) return activePresetLabel;

  const fromLocal = value.created_at_from
    ? isoToDateTimeLocal(value.created_at_from)
    : '';
  const toLocal = value.created_at_to
    ? isoToDateTimeLocal(value.created_at_to)
    : '';

  if (fromLocal && toLocal) return `${fromLocal} → ${toLocal}`;
  if (fromLocal) return `Since ${fromLocal}`;
  if (toLocal) return `Until ${toLocal}`;
  return 'All time';
}

/**
 * For date-only pickers:
 * - From: start of day (00:00:00.000 local)
 * - To: end of day (23:59:59.999 local)
 *
 * This makes the selected "To" include the full day.
 */
function startOfDayLocal(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayLocal(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

interface TimePeriodDropdownProps {
  value?: AuditLogTimeRange;
  onChange: (value: AuditLogTimeRange) => void;
  resolveNow?: () => Date;
  disabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const TimePeriodDropdown = ({
  value,
  onChange,
  resolveNow,
  disabled = false,
  onOpenChange,
}: TimePeriodDropdownProps) => {
  const nowFn = resolveNow ?? (() => new Date());
  const presets = TIME_RANGE_PRESETS;

  const presetById = useMemo(() => {
    const map = new Map<PresetId, Preset>();
    presets.forEach((p) => map.set(p.id, p));
    return map;
  }, [presets]);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<AuditLogTimeRange>({});
  const selected = (isControlled ? value : internalValue) ?? {};

  const activePresetId = useMemo(() => {
    if (!selected.created_at_from) return undefined;
    if (selected.created_at_to) return undefined;

    const selectedMs = new Date(selected.created_at_from).getTime();
    if (Number.isNaN(selectedMs)) return undefined;

    for (const p of presets) {
      const ms = sub(nowFn(), p.amount, p.unit).getTime();
      if (Math.abs(ms - selectedMs) <= 60_000) return p.id;
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.created_at_from, selected.created_at_to]); // nowFn intentionally not in deps

  const activePreset = activePresetId
    ? presetById.get(activePresetId)
    : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPanel, setShowCustomPanel] = useState<boolean>(() => {
    return (
      !!(selected.created_at_from || selected.created_at_to) && !activePresetId
    );
  });

  const [customFrom, setCustomFrom] = useState<Date | null>(() =>
    selected.created_at_from ? new Date(selected.created_at_from) : null,
  );
  const [customTo, setCustomTo] = useState<Date | null>(() =>
    selected.created_at_to ? new Date(selected.created_at_to) : null,
  );

  const commit = (next: AuditLogTimeRange) => {
    if (!isControlled) setInternalValue(next);
    onChange(next);
  };

  const computePresetRange = (p: Preset): AuditLogTimeRange => ({
    created_at_from: sub(nowFn(), p.amount, p.unit).toISOString(),
  });

  const onSelectAllTime = () => {
    setShowCustomPanel(false);
    setCustomFrom(null);
    setCustomTo(null);

    commit({});
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const onSelectPreset = (p: Preset) => {
    setShowCustomPanel(false);
    commit(computePresetRange(p));
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const onSelectCustom = () => {
    setShowCustomPanel(true);
  };

  const applyCustom = () => {
    const from = customFrom ? startOfDayLocal(customFrom) : null;
    const to = customTo ? endOfDayLocal(customTo) : null;

    const next: AuditLogTimeRange = {
      created_at_from: from ? from.toISOString() : undefined,
      created_at_to: to ? to.toISOString() : undefined,
    };

    if (!isValidRange(next)) return;

    commit({
      ...(next.created_at_from
        ? { created_at_from: next.created_at_from }
        : {}),
      ...(next.created_at_to ? { created_at_to: next.created_at_to } : {}),
    });

    setIsOpen(false);
    onOpenChange?.(false);
  };

  const label = formatLabel(selected, activePreset?.label);

  const selectedValue = useMemo(() => {
    const id = `range:${selected.created_at_from ?? ''}:${selected.created_at_to ?? ''}:${activePresetId ?? ''}`;
    return { id, name: `Time Period: ${label}` } as DropdownItemsModel;
  }, [activePresetId, label, selected.created_at_from, selected.created_at_to]);

  return (
    <Dropdown
      selectedValue={selectedValue}
      listClassName="w-[272px]"
      isMenuOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        onOpenChange?.(open);

        if (open) {
          if (!activePresetId) {
            setCustomFrom(
              selected.created_at_from
                ? new Date(selected.created_at_from)
                : null,
            );
            setCustomTo(
              selected.created_at_to ? new Date(selected.created_at_to) : null,
            );
          }
          setShowCustomPanel(
            !!(selected.created_at_from || selected.created_at_to) &&
              !activePresetId,
          );
        }
      }}
    >
      <DropdownMenuItem
        dropdownItem={
          { id: 'all_time', name: 'All time', sectionEnd: true } as any
        }
        onClick={onSelectAllTime}
        disabled={disabled}
      />

      <DropdownMenuItem
        dropdownItem={
          { id: 'custom', name: 'Custom range…', sectionEnd: true } as any
        }
        onClick={onSelectCustom}
        disabled={disabled}
        closeOnClick={false}
      />

      {showCustomPanel && (
        <>
          <div
            className="m-3 flex flex-col gap-4"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <DatePicker
              id="audit-log-from"
              label="From"
              date={customFrom}
              setDate={(d) => setCustomFrom(d ? startOfDayLocal(d) : null)}
              dateFormat="MM-dd-yyyy"
              placeholder="MM-DD-YYYY"
              selectsStart
              startDate={customFrom}
              endDate={customTo}
              maxDate={customTo ?? undefined}
              preventOpenOnFocus
            />

            <DatePicker
              id="audit-log-to"
              label="To"
              date={customTo}
              setDate={(d) => setCustomTo(d ? endOfDayLocal(d) : null)}
              dateFormat="MM-dd-yyyy"
              placeholder="MM-DD-YYYY"
              selectsEnd
              startDate={customFrom}
              endDate={customTo}
              minDate={customFrom ?? undefined}
              preventOpenOnFocus
            />

            <Button cssClass="primary" title="Apply" onClick={applyCustom} />
          </div>
          <div className="w-full border border-primary my-1" />
        </>
      )}

      {presets.map((p) => {
        const active = activePresetId === p.id;

        return (
          <DropdownMenuItem
            key={p.id}
            dropdownItem={{
              id: p.id,
              name: p.label,
              sectionEnd: p.sectionEnd,
              sectionStart: p.sectionStart,
            }}
            className={classNames(
              active &&
                'bg-accent-primary-alpha !border-l border-l-accent-primary focus-visible:border-solid',
            )}
            onClick={() => onSelectPreset(p)}
            disabled={disabled}
          />
        );
      })}
    </Dropdown>
  );
};
