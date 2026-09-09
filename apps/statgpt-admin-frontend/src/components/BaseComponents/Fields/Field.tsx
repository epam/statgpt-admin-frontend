import { FC } from 'react';

import { mergeClasses } from '@/src/utils/mergeClasses';

interface Props {
  fieldTitle?: string;
  htmlFor: string;
  optional?: boolean;
  className?: string;
}

const Field: FC<Props> = ({ fieldTitle, htmlFor, optional, className }) => {
  return (
    <label
      className={mergeClasses('tiny mb-2 text-secondary', className)}
      htmlFor={htmlFor}
    >
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
