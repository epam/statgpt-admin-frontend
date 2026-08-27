import { ComponentType } from 'react';

export interface StatusIconProps {
  size?: number;
  className?: string;
}

export interface StatusVisual {
  label: string;
  icon?: ComponentType<StatusIconProps>;
  iconColorClass?: string;
  textColorClass?: string;
}
