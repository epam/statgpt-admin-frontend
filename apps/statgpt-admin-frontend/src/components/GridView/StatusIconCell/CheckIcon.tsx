'use client';

import Check from '@/public/icons/check.svg';
import { mergeClasses } from '@/src/utils/mergeClasses';
import { StatusIconProps } from './types';

export const CheckIcon = ({ className }: StatusIconProps) => (
  <Check
    className={mergeClasses(
      '[&_path]:fill-[var(--icon-accent-secondary,#37BABC)] size-4',
      className,
    )}
  />
);
