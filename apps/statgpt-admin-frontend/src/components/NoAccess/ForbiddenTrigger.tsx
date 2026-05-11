'use client';

import { useLayoutEffect } from 'react';

import { useAccessControl } from '@/src/context/AccessControlContext';

export function ForbiddenTrigger() {
  const { setForbidden } = useAccessControl();
  useLayoutEffect(() => {
    setForbidden();
  }, [setForbidden]);
  return null;
}
