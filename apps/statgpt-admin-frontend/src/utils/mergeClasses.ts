import classNames from 'classnames';
import { extendTailwindMerge } from 'tailwind-merge';

type CustomGroups = 'typography';

const twMerge = extendTailwindMerge<CustomGroups>({
  extend: {
    classGroups: {
      typography: [
        'heading-1',
        'heading-2',
        'heading-3',
        'body',
        'small-medium',
        'small-150',
        'tiny-150',
        'caption',
      ],
    },
  },
});

export function mergeClasses(...inputs: Parameters<typeof classNames>): string {
  return twMerge(classNames(...inputs));
}
