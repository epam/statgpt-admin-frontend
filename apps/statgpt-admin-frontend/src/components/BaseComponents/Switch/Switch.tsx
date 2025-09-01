'use client';

import classNames from 'classnames';
import { ChangeEvent, FC, useCallback } from 'react';

interface Props {
  title: string;
  switchId: string;
  isOn?: boolean;
  onChange?: (value: boolean) => void;
}

const Switch: FC<Props> = ({ title, switchId, isOn = false, onChange }) => {
  const switchClassName = classNames(
    'flex w-[36px] h-[18px] cursor-pointer items-center gap-1 rounded-full p-0.5 transition-all duration-200',
    isOn ? 'flex-row-reverse bg-accent-primary' : 'flex-row bg-layer-4',
  );

  const onClick = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onChange?.(!isOn);
    },
    [onChange, isOn],
  );

  return (
    <div className="flex flex-row items-center">
      <input
        type="checkbox"
        onChange={onClick}
        id={switchId}
        className="invisible w-0 h-0"
        checked={isOn}
      />
      <label htmlFor={switchId} className={switchClassName}>
        <span className="size-3 rounded-full bg-control-enable-primary"></span>
      </label>
      {title && (
        <span className="h-[14px] pl-2 small text-primary">{title}</span>
      )}
    </div>
  );
};

export default Switch;
