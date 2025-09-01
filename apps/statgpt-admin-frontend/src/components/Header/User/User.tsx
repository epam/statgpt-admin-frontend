import { IconChevronDown, IconUser } from '@tabler/icons-react';

import { useLogout } from '@/src/hooks/use-logout';
import { FC } from 'react';

interface Props {
  isOpen: boolean;
}

export const User: FC<Props> = ({ isOpen }) => {
  const { session } = useLogout();

  return (
    session && (
      <div className="flex w-full cursor-pointer items-center justify-between gap-2 pr-3">
        <div className="flex items-center gap-3">
          {session?.user?.image ? (
            <img
              className="rounded"
              src={session?.user?.image}
              width={18}
              height={18}
              alt={'User avatar'}
            />
          ) : (
            <IconUser width={18} height={18} />
          )}

          <span className="grow small">{session?.user?.name || 'User'}</span>
        </div>
        <IconChevronDown
          className={`shrink-0 text-primary transition-all ${
            isOpen ? 'rotate-180' : ''
          }`}
          width={18}
          height={18}
        />
      </div>
    )
  );
};
