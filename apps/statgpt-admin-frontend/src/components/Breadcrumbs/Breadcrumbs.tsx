import { FC } from 'react';

import ChevronRight from '@/public/icons/chevron-right.svg';
import { Breadcrumb } from '@/src/models/breadcrumbs';
import { BreadcrumbItem } from './Breadcrumb';

interface Props {
  breadcrumbs: Breadcrumb[];
}

export const Breadcrumbs: FC<Props> = ({ breadcrumbs }) => {
  return (
    <div className="flex flex-row items-center mr-4 cursor-pointer tiny text-secondary">
      {breadcrumbs.map((breadcrumb, i) => (
        <div className="flex flex-row" key={i}>
          <BreadcrumbItem breadcrumb={breadcrumb} />
          {i !== breadcrumbs.length - 1 && (
            <div className="ml-1 mr-1">
              <ChevronRight />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
