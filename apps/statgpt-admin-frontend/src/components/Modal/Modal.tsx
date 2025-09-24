import React, { FC } from 'react';

import styles from './modal.module.scss';
import { IconX } from '@tabler/icons-react';

interface Props {
  title: string;
  close: () => void;
  height?: string;
  width?: string;
  cssClassHeader?: string;
  children: React.ReactNode[];
}
// TODO: remove Modal component and use ModalView.tsx instead
export const Modal: FC<Props> = ({
  title,
  close,
  children,
  height,
  width,
  cssClassHeader,
}) => {
  return (
    <div className={styles.modal__wrapper}>
      <div className={styles.modal} style={{ height, width }}>
        <div className={`${styles.modal__header} ${cssClassHeader || ''}`}>
          <div className="flex flex-row justify-between w-full items-center">
            <h3>{title}</h3>
            <button
              type="button"
              role="button"
              className="absolute right-2 top-2 rounded text-secondary hover:text-accent-primary"
              onClick={close}
            >
              <IconX height={24} width={24} />
            </button>
          </div>

          {children[0]}
        </div>
        <div className={styles.modal__body}>{children[1]}</div>
        <div className={styles.modal__footer}>{children[2]}</div>
      </div>
    </div>
  );
};
