'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCopy, IconCopyCheck } from '@tabler/icons-react';

export const CopyButton = ({ onClick }: { onClick: () => void }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    onClick();

    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button onClick={handleClick}>
      {copied ? (
        <IconCopyCheck className="size-4 text-accent-primary" />
      ) : (
        <IconCopy className="size-4 text-secondary hover:text-accent-primary" />
      )}
    </button>
  );
};
