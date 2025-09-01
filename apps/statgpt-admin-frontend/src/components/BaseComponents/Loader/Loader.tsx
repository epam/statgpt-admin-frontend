import { FC } from 'react';
import styles from './loader.module.scss';
import classNames from 'classnames';
import LoaderIcon from '@/public/icons/loader-small.svg';

export const Loader: FC = () => {
  return (
    <div className={`${styles.loader}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

interface Props {
  size?: number;
  loaderClassName?: string;
  containerClassName?: string;
}


const LoaderSmall: FC<Props> = ({
  size = 18,
  loaderClassName = '',
  containerClassName = '',
}) => {
  return (
    <div
      className={classNames(
        'flex w-full items-center justify-center text-secondary',
        containerClassName || 'h-full',
      )}
    >
      <LoaderIcon
        height={size}
        width={size}
        className={classNames(
          'shrink-0 grow-0 basis-auto animate-spin-steps',
          loaderClassName,
        )}
      />
    </div>
  );
};

export default LoaderSmall;
