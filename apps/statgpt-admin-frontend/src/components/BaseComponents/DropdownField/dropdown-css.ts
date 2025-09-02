import classNames from 'classnames';

export const menuItemClassNames = classNames(
  'flex w-full cursor-pointer items-center gap-3 focus-visible:border-none focus-visible:outline-none',
  'hover:bg-accent-primary-alpha pl-3',
);
export const dropdownMenuClassNames = classNames(
  'z-[101] overflow-auto rounded bg-layer-0 text-primary shadow focus-visible:outline-none',
);
