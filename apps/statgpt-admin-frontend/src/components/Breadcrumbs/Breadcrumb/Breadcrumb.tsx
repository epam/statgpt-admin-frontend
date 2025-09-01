import { FC } from 'react';
import { Breadcrumb } from '@/src/models/breadcrumbs';

interface Props {
  breadcrumb: Breadcrumb;
}

export const BreadcrumbItem: FC<Props> = ({ breadcrumb }) => {
  return <span onClick={() => breadcrumb.click?.()}>{breadcrumb.name}</span>;
};
