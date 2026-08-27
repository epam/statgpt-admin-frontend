'use client';

import { mergeClasses } from '@/src/utils/mergeClasses';
import { StatusIconProps } from './types';
import { ComponentType } from 'react';
import { Tooltip } from '@/src/components/BaseComponents/Tooltip/Tooltip';

interface Props {
  icon?: ComponentType<StatusIconProps>;
  colorClass?: string;
  tooltipContent?: string;
}

export const StatusIcon = ({
  icon: Icon,
  colorClass,
  tooltipContent,
}: Props) => {
  if (!Icon) return null;

  const iconEl = (
    <Icon
      size={16}
      className={mergeClasses(
        'flex-shrink-0 ml-auto',
        colorClass,
        tooltipContent && 'cursor-help',
      )}
    />
  );

  return tooltipContent ? (
    <Tooltip content={tooltipContent} className="ml-auto flex-shrink-0">
      {iconEl}
    </Tooltip>
  ) : (
    iconEl
  );
};
