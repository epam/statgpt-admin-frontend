'use client';

import {
  CSSProperties,
  FC,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { mergeClasses } from '@/src/utils/mergeClasses';

const VIEWPORT_MARGIN = 8;
const GAP = 4;
const MAX_TOOLTIP_HEIGHT = 200;

interface Props {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Tooltip: FC<Props> = ({ content, children, className }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [positionStyle, setPositionStyle] = useState<CSSProperties>({
    visibility: 'hidden',
  });
  const [contentMaxHeight, setContentMaxHeight] = useState<number | undefined>(
    undefined,
  );

  if (!content) return <>{children}</>;

  const handleMouseEnter = () => {
    setPositionStyle({ visibility: 'hidden' });
    setContentMaxHeight(undefined);
    setVisible(true);
  };

  const handleMouseLeave = () => setVisible(false);

  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !triggerRef.current) return;

    const tooltipWidth = tooltipRef.current.offsetWidth;
    const rect = triggerRef.current.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, window.innerWidth - tooltipWidth - VIEWPORT_MARGIN),
    );

    const availableHeight = rect.top - GAP - VIEWPORT_MARGIN;
    setContentMaxHeight(Math.min(MAX_TOOLTIP_HEIGHT, availableHeight));

    setPositionStyle({
      left: `${left}px`,
      top: `${rect.top - GAP}px`,
      transform: 'translateY(-100%)',
    });
  }, [visible]);

  return (
    <div
      ref={triggerRef}
      className={mergeClasses('inline-flex', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            style={positionStyle}
            className="pointer-events-none fixed z-[9999] max-w-64"
          >
            <div
              style={
                contentMaxHeight != null
                  ? { maxHeight: contentMaxHeight, overflow: 'hidden' }
                  : undefined
              }
              className="rounded border border-primary bg-layer-2 px-3 py-2 text-xs text-primary shadow-lg break-words whitespace-normal"
            >
              {content}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
