import {
  ChangeEvent,
  HTMLProps,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';

import { DropdownProps } from '@/src/components/BaseComponents/DropdownField/DropdownComponent';
import { dropdownMenuClassNames } from '@/src/components/BaseComponents/DropdownField/dropdown-css';
import DropdownAutocompleteItem from './DropdownAutocompleteItem';

export interface DropdownAutocompleteProps extends DropdownProps {
  inputId: string;
  items: string[];
  onSelectItem?: (value: string) => void;
}

const DropdownAutocomplete = forwardRef<
  HTMLDivElement,
  DropdownAutocompleteProps & HTMLProps<HTMLButtonElement>
>(function DropdownAutocomplete(
  { items, value, style, placeholder, onSelectItem, disabled, inputId },
  _,
) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const listRef = useRef<(HTMLElement | null)[]>([]);

  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      offset(0),
      flip(),
      shift(),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });

  const role = useRole(context, { role: 'listbox' });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav],
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      onSelectItem?.(value);
      if (value) {
        setOpen(true);
        setActiveIndex(0);
      } else {
        setOpen(false);
      }
    },
    [onSelectItem],
  );

  useEffect(() => {
    const defaultValue = typeof value === 'string' ? value : '';
    setInputValue(defaultValue);
  }, [value]);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().startsWith(inputValue.toLowerCase()),
  );

  return (
    <>
      <input
        id={inputId}
        className="input"
        {...getReferenceProps({
          ref: refs.setReference,
          onChange,
          disabled,
          value: inputValue,
          placeholder: placeholder,
          'aria-autocomplete': 'list',
          onKeyDown: (event) => {
            if (
              event.key === 'Enter' &&
              activeIndex != null &&
              filteredItems[activeIndex]
            ) {
              setInputValue(filteredItems[activeIndex]);
              setActiveIndex(null);
              setOpen(false);
            }
          },
        })}
      />
      <FloatingPortal>
        {open && (
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <div
              className={dropdownMenuClassNames}
              {...getFloatingProps({
                ref: refs.setFloating,
                style: {
                  ...floatingStyles,
                  ...style,
                },
              })}
            >
              {filteredItems.map((item, index) => (
                /* eslint-disable react/jsx-key */
                <DropdownAutocompleteItem
                  {...getItemProps({
                    key: item,
                    ref: (node) => {
                      listRef.current[index] = node;
                    },
                    onClick: () => {
                      setInputValue(item);
                      onSelectItem?.(item);
                      setOpen(false);
                      refs.domReference.current?.focus();
                    },
                  })}
                  label={item}
                  active={activeIndex === index}
                />
              ))}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
});

export default DropdownAutocomplete;
