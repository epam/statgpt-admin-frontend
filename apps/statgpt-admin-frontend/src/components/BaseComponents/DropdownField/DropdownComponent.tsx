'use client';

import {
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  Placement,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from '@floating-ui/react';
import classNames from 'classnames';
import {
  Dispatch,
  FocusEvent,
  HTMLProps,
  ReactNode,
  SetStateAction,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { dropdownMenuClassNames, menuItemClassNames } from './dropdown-css';
import { DropdownSelectedItem } from './DropdownSelectedValue';
import { DropdownItemsModel, DropdownType } from './dropdown.model';

export const MenuContext = createContext<{
  getItemProps: (userProps?: HTMLProps<HTMLElement>) => Record<string, unknown>;
  activeIndex: number | null;
  setActiveIndex: Dispatch<SetStateAction<number | null>>;
  setHasFocusInside: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean | undefined;
}>({
  getItemProps: () => ({}),
  activeIndex: null,
  setActiveIndex: () => ({}),
  setHasFocusInside: () => ({}),
  isOpen: false,
});

export interface DropdownProps {
  listClassName?: string;
  trigger?: ReactNode;
  nested?: boolean;
  children?: ReactNode;
  type?: DropdownType;
  selectedValue?: DropdownItemsModel;
  isMenuOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: Placement;
  shouldFlip?: boolean;
  shouldApplySize?: boolean;
  enableAncestorScroll?: boolean;
  noFocusReturn?: boolean;
  isTriggerEnabled?: boolean;
  placeholderClass?: string;
  height?: number;
}

export const DropdownMenuComponent = forwardRef<
  HTMLDivElement,
  DropdownProps & HTMLProps<HTMLButtonElement>
>(function MenuComponent(
  {
    children,
    style,
    className,
    listClassName,
    placeholder,
    placeholderClass,
    selectedValue,
    trigger,
    type = DropdownType.Dropdown,
    placement,
    isMenuOpen,
    onOpenChange,
    shouldFlip = true,
    shouldApplySize = true,
    noFocusReturn = false,
    enableAncestorScroll = false,
    isTriggerEnabled = true,
    height,
    ...props
  },
  forwardedRef,
) {
  const [isOpen, setIsOpen] = useState(isMenuOpen);
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [floatingWidth, setFloatingWidth] = useState(0);

  const elementsRef = useRef<HTMLButtonElement[]>([]);
  const labelsRef = useRef<string[]>([]);
  const parent = useContext(MenuContext);

  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const item = useListItem();

  const isNested = parentId != null;

  useEffect(() => {
    setIsOpen(isMenuOpen);
  }, [isMenuOpen]);

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: isOpen,
    onOpenChange: (isOpened) => {
      setIsOpen(isOpened);
      onOpenChange?.(isOpened);
    },
    placement: placement ?? (isNested ? 'right-start' : 'bottom-start'),
    middleware: [
      offset(0),
      ...(shouldFlip ? [flip()] : []),
      shift(),
      ...(shouldApplySize
        ? [
            size({
              apply({ rects, availableWidth, availableHeight, elements }) {
                setFloatingWidth(rects.reference.width);
                Object.assign(elements.floating.style, {
                  maxWidth: `${availableWidth}px`,
                  maxHeight: `${availableHeight}px`,
                });
              },
            }),
          ]
        : []),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: isNested,
    delay: { open: 75 },
    handleClose: safePolygon({
      blockPointerEvents: true,
      buffer: -Infinity,
      requireIntent: false,
    }),
  });

  const click = useClick(context, {
    event: 'mousedown',
    toggle: !isNested,
    enabled: isTriggerEnabled,
    ignoreMouse: isNested,
  });

  const role = useRole(context, { role: 'menu' });
  const dismiss = useDismiss(context, {
    bubbles: true,
    ancestorScroll: enableAncestorScroll,
  });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    onMatch: isOpen ? setActiveIndex : undefined,
    activeIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [hover, click, role, dismiss, listNavigation, typeahead],
  );

  // Event emitter allows you to communicate across tree components.
  // This effect closes all menus when an item gets clicked anywhere
  // in the tree.
  useEffect(() => {
    if (!tree) {
      return;
    }

    const handleTreeClick = () => {
      setIsOpen(false);
    };

    const onSubMenuOpen = (event: { nodeId: string; parentId: string }) => {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setIsOpen(false);
      }
    };

    tree.events.on('click', handleTreeClick);
    tree.events.on('menuopen', onSubMenuOpen);

    return () => {
      tree.events.off('click', handleTreeClick);
      tree.events.off('menuopen', onSubMenuOpen);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) {
      tree.events.emit('menuopen', { parentId, nodeId });
    }
  }, [tree, isOpen, nodeId, parentId]);

  return (
    <FloatingNode id={nodeId}>
      <div
        ref={useMergeRefs([refs.setReference, item.ref, forwardedRef])}
        tabIndex={
          !isNested ? undefined : parent.activeIndex === item.index ? 0 : -1
        }
        data-open={isOpen ? '' : undefined}
        data-nested={isNested ? '' : undefined}
        data-focus-inside={hasFocusInside ? '' : undefined}
        role="menu"
        className={classNames(
          isNested && menuItemClassNames,
          isNested ? 'h-[34px] w-full px-3' : 'h-full px-0',
          className,
        )}
        {...getReferenceProps(
          parent.getItemProps({
            ...props,
            onFocus(event: FocusEvent<HTMLButtonElement>) {
              props.onFocus?.(event);
              setHasFocusInside(false);
              parent.setHasFocusInside(true);
            },
          }),
        )}
      >
        {trigger}
        {!trigger && (
          <DropdownSelectedItem
            placeholderClass={placeholderClass}
            placeholder={placeholder}
            selectedValue={selectedValue}
            isOpen={isMenuOpen}
            disabled={!isTriggerEnabled}
            height={height}
          />
        )}
      </div>
      <MenuContext.Provider
        value={{
          activeIndex,
          setActiveIndex,
          getItemProps,
          setHasFocusInside,
          isOpen,
        }}
      >
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {isOpen && (
            <FloatingPortal id="theme-main">
              <FloatingFocusManager
                context={context}
                modal={false}
                initialFocus={isNested ? -1 : 0}
                returnFocus={noFocusReturn ? false : !isNested}
              >
                <div
                  className={classNames(dropdownMenuClassNames, listClassName)}
                  ref={refs.setFloating}
                  style={{
                    ...floatingStyles,
                    ...style,
                    ...(type === DropdownType.Dropdown && {
                      width: `${floatingWidth}px`,
                    }),
                  }}
                  {...getFloatingProps()}
                >
                  {children}
                </div>
              </FloatingFocusManager>
            </FloatingPortal>
          )}
        </FloatingList>
      </MenuContext.Provider>
    </FloatingNode>
  );
});
