/**
 * Renders a labeled read-only value.
 * @param label - field label
 * @param value - text to show
 * @param emptyText - shown instead when the value is empty or whitespace-only; nothing is shown if omitted
 */
export const DataField = ({
  label,
  value = '',
  emptyText = '',
}: {
  label: string;
  value?: string | null;
  emptyText?: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="tiny text-secondary">{label}</span>
      <span className="body text-primary">
        {value?.trim() ? value : emptyText}
      </span>
    </div>
  );
};
