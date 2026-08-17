import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  getTodayEthiopian,
  formatEthiopian,
  parseEthiopianDateString,
  isValidEthiopianDate,
  getEthiopianMonthNames,
  daysInEthiopianMonth,
  toGregorian
} from '@/utils/ethiopianDate';
import { cn } from '@/lib/utils';

interface EthiopianDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const EthiopianDatePicker: React.FC<EthiopianDatePickerProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial or default value
  const getInitialState = () => {
    if (value && isValidEthiopianDate(value)) {
      return parseEthiopianDateString(value);
    }
    return getTodayEthiopian();
  };

  const initial = getInitialState();
  const [currentYear, setCurrentYear] = useState(initial.year);
  const [currentMonth, setCurrentMonth] = useState(initial.month);

  useEffect(() => {
    if (value && isValidEthiopianDate(value)) {
      const parsed = parseEthiopianDateString(value);
      setCurrentYear(parsed.year);
      setCurrentMonth(parsed.month);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = getEthiopianMonthNames('en');
  const totalDays = daysInEthiopianMonth(currentYear, currentMonth);

  // Calculate weekday of Meskerem 1st / Month 1st to align the calendar grid
  const getStartingDayOfWeek = () => {
    try {
      const greg = toGregorian({ year: currentYear, month: currentMonth, day: 1 });
      return greg.getDay(); // 0 is Sunday, 1 is Monday, etc.
    } catch {
      return 0;
    }
  };

  const startingDay = getStartingDayOfWeek();

  const handleSelectDay = (day: number) => {
    const formatted = formatEthiopian({ year: currentYear, month: currentMonth, day });
    onChange(formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(13);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 13) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Current selected day indicator
  const selectedDate = value && isValidEthiopianDate(value) ? parseEthiopianDateString(value) : null;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <input
          type="text"
          readOnly
          disabled={disabled}
          value={value || ''}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex h-11 w-full rounded-xl border border-border bg-card text-card-foreground px-3 py-2 pl-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          placeholder="YYYY-MM-DD (Ethiopian)"
        />
        <CalendarIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-pointer pointer-events-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-[310px] bg-popover text-popover-foreground rounded-2xl shadow-xl border border-border">
          {/* Header controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-muted/20 hover:bg-accent rounded-lg text-muted-foreground transition-all"
            >
              <CaretLeft size={18} />
            </button>
            <div className="text-base font-bold text-foreground">
              {months[currentMonth - 1]} {currentYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-muted/20 hover:bg-accent rounded-lg text-muted-foreground transition-all"
            >
              <CaretRight size={18} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekdays.map((w, idx) => (
              <span key={idx} className="text-sm font-semibold text-muted-foreground">
                {w}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before start day */}
            {Array.from({ length: startingDay }).map((_, idx) => (
              <span key={`empty-${idx}`} />
            ))}

            {/* Days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedDate &&
                selectedDate.year === currentYear &&
                selectedDate.month === currentMonth &&
                selectedDate.day === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'h-8 w-8 text-sm font-medium rounded-lg transition-all',
                    isSelected
                      ? 'bg-[#5A3E2B] text-white hover:bg-[#5a3d09]'
                      : 'text-foreground hover:bg-muted/20 hover:bg-accent'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
