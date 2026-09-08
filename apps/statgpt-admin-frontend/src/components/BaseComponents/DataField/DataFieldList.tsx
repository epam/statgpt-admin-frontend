import { DataField } from './DataField';

/**
 * Renders a delimited, multi-value field as a bulleted list. Falls back to
 * plain text (same as `DataField`) when the value doesn't split into at
 * least two non-empty segments - covers empty values, single values, and
 * malformed/inconsistent delimiters.
 * @param label - field label
 * @param value - raw delimited string value
 * @param delimiter - separator to split on, defaults to `;`
 */
export const DataFieldList = ({
  label,
  value = '',
  delimiter = ';',
}: {
  label: string;
  value?: string | null;
  delimiter?: string;
}) => {
  const items = (value ?? '')
    .split(delimiter)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (items.length < 2) {
    return <DataField label={label} value={value} />;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="tiny text-secondary">{label}</span>
      <ul className="body text-primary list-disc pl-4">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
