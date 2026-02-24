import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendarEvent,
} from '@tabler/icons-react';
import { FC, useCallback } from 'react';
import ReactDatePicker, { DatePickerProps } from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

type PickerProps = Omit<DatePickerProps, 'date'>;

interface Props extends PickerProps {
  id: string;
  label?: string;
  date: Date | null;
  dateFormat?: string;
  placeholder?: string;
  showTimeInput?: boolean;
  setDate: (date: Date | null) => void;
}

const DatePicker: FC<Props> = ({
  id,
  label,
  date,
  dateFormat,
  placeholder,
  showTimeInput,
  setDate,
  ...props
}) => {
  const customWeekdayFormat = (day: string) => {
    return day.slice(0, 3);
  };

  const onChange = useCallback(
    (date: Date) => {
      setDate(date);
    },
    [setDate],
  );

  return (
    <div className="cursor-pointer">
      {label && (
        <label htmlFor={id}>
          <p className="tiny text-secondary mb-2">{label}</p>
        </label>
      )}
      <ReactDatePicker
        id={id}
        placeholderText={placeholder || 'MM-DD-YYYY'}
        dateFormat={dateFormat || 'MM-dd-yyyy'}
        calendarStartDay={1}
        selected={date}
        onChange={onChange}
        previousMonthButtonLabel={<IconChevronLeft className="size-[18px]" />}
        nextMonthButtonLabel={<IconChevronRight className="size-[18px]" />}
        formatWeekDay={customWeekdayFormat}
        showTimeInput={showTimeInput}
        timeInputLabel=""
        shouldCloseOnSelect={true}
        showIcon
        toggleCalendarOnIconClick
        icon={<IconCalendarEvent className="size-[18px]" />}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
      />
    </div>
  );
};

export default DatePicker;
