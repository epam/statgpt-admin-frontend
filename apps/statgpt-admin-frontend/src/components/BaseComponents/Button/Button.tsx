import { FC, ReactNode } from 'react';

interface Props {
  cssClass?: string;
  disable?: boolean;
  title?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export const Button: FC<Props> = ({
  title,
  icon,
  cssClass,
  onClick,
  disable,
}) => {
  return (
    <button
      type="button"
      className={`${cssClass || ''}`}
      onClick={() => onClick?.()}
      disabled={disable}
    >
      {icon}
      {title}
    </button>
  );
};
