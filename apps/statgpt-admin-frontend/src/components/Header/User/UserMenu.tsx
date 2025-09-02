import { useState } from 'react';
import { IconLogout } from '@tabler/icons-react';

import { ConfirmDialog } from '@/src/components/BaseComponents/ConfirmDialog/ConfirmDialog';
import {
  Menu,
  MenuItem,
} from '@/src/components/BaseComponents/Dropdown/DropdownMenu';
import { useLogout } from '@/src/hooks/use-logout';
import { PopUpState } from '@/src/types/modal';
import { User } from '@/src/components/Header/User/User';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session, handleLogout } = useLogout();
  const [modalState, setModalState] = useState(PopUpState.Closed);

  const handleLogOutClick = () => {
    if (!session) {
      handleLogout();
    } else {
      setModalState(PopUpState.Opened);
    }
  };

  return (
    <>
      <Menu
        className="flex min-w-[120px] items-center"
        onOpenChange={setIsOpen}
        trigger={<User isOpen={isOpen} />}
      >
        <MenuItem
          className="hover:bg-accent-primary-alpha"
          item={
            <div className="flex gap-3 items-center">
              <IconLogout width={18} height={18} className="text-secondary" />
              <span className="small">{session ? 'Log out' : 'Login'}</span>
            </div>
          }
          onClick={() => handleLogOutClick()}
        />
      </Menu>

      {modalState === PopUpState.Opened && (
        <ConfirmDialog
          modalState={modalState}
          header="Confirm logging out"
          description="Are you sure that you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          onClose={(result) => {
            setModalState(PopUpState.Closed);
            if (result) {
              handleLogout();
            }
          }}
        />
      )}
    </>
  );
};
