import { FC } from 'react';

interface Props {
  fieldTitle?: string;
  htmlFor: string;
  optional?: boolean;
}

const Field: FC<Props> = ({ fieldTitle, htmlFor, optional }) => {
  return (
    <label className="tiny mb-2 text-secondary" htmlFor={htmlFor}>
      {fieldTitle && (
        <>
          {fieldTitle}
          {optional ? (
            <span className="ml-1">(Optional)</span>
          ) : (
            <span className="ml-1 text-accent-primary">*</span>
          )}
        </>
      )}
    </label>
  );
};

export default Field;
