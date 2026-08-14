export const DataField = ({
  label,
  value = '',
}: {
  label: string;
  value?: string | null;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="tiny text-secondary">{label}</span>
      <span className="body text-primary">{value}</span>
    </div>
  );
};
