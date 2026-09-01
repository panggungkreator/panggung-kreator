"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateBirthLineProps {
  id?: string;
  label: string;
  value?: string; // Format: YYYY-MM-DD
  onChange?: (val: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  { short: "Jan", full: "Januari", index: 0 },
  { short: "Feb", full: "Februari", index: 1 },
  { short: "Mar", full: "Maret", index: 2 },
  { short: "Apr", full: "April", index: 3 },
  { short: "May", full: "Mei", index: 4 },
  { short: "Jun", full: "Juni", index: 5 },
  { short: "Jul", full: "Juli", index: 6 },
  { short: "Aug", full: "Agustus", index: 7 },
  { short: "Sep", full: "September", index: 8 },
  { short: "Oct", full: "Oktober", index: 9 },
  { short: "Nov", full: "November", index: 10 },
  { short: "Dec", full: "Desember", index: 11 },
];

export const DateBirthLine: React.FC<DateBirthLineProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = "Pilih tanggal lahir",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial value or default to 1998-06-24
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { year: y, monthIndex: m, day: d };
      }
    }
    return null;
  }, [value]);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const currentDay = today.getDate();

  const [tempYear, setTempYear] = useState<number>(parsedDate?.year || currentYear);
  const [tempMonthIndex, setTempMonthIndex] = useState<number>(parsedDate?.monthIndex ?? currentMonthIndex);
  const [tempDay, setTempDay] = useState<number>(parsedDate?.day || currentDay);

  // Sync temp values when popover opens or value prop changes
  useEffect(() => {
    if (isOpen) {
      if (parsedDate) {
        setTempYear(parsedDate.year);
        setTempMonthIndex(parsedDate.monthIndex);
        setTempDay(parsedDate.day);
      } else {
        const now = new Date();
        setTempYear(now.getFullYear());
        setTempMonthIndex(now.getMonth());
        setTempDay(now.getDate());
      }
    }
  }, [isOpen, parsedDate]);

  // Generate list of years (1940 to currentYear)
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= 1940; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Available months (restricted to <= currentMonthIndex if currentYear is selected)
  const availableMonths = useMemo(() => {
    if (tempYear === currentYear) {
      return MONTH_NAMES.filter((m) => m.index <= currentMonthIndex);
    }
    return MONTH_NAMES;
  }, [tempYear, currentYear, currentMonthIndex]);

  // Max days in selected month/year (restricted to <= currentDay if currentYear and currentMonthIndex are selected)
  const maxDays = useMemo(() => {
    const totalDays = new Date(tempYear, tempMonthIndex + 1, 0).getDate();
    if (tempYear === currentYear && tempMonthIndex === currentMonthIndex) {
      return Math.min(totalDays, currentDay);
    }
    return totalDays;
  }, [tempYear, tempMonthIndex, currentYear, currentMonthIndex, currentDay]);

  // Generate list of days
  const days = useMemo(() => {
    const list: number[] = [];
    for (let d = 1; d <= maxDays; d++) {
      list.push(d);
    }
    return list;
  }, [maxDays]);

  // Adjust tempMonthIndex if it exceeds available months for currentYear
  useEffect(() => {
    if (tempYear === currentYear && tempMonthIndex > currentMonthIndex) {
      setTempMonthIndex(currentMonthIndex);
    }
  }, [tempYear, tempMonthIndex, currentYear, currentMonthIndex]);

  // Adjust tempDay if it exceeds maxDays
  useEffect(() => {
    if (tempDay > maxDays) {
      setTempDay(maxDays);
    }
  }, [maxDays, tempDay]);

  const handleSubmit = () => {
    let finalYear = tempYear;
    let finalMonthIndex = tempMonthIndex;
    let finalDay = tempDay;

    if (finalYear > currentYear) {
      finalYear = currentYear;
    }
    if (finalYear === currentYear && finalMonthIndex > currentMonthIndex) {
      finalMonthIndex = currentMonthIndex;
    }
    const maxAllowedDay = new Date(finalYear, finalMonthIndex + 1, 0).getDate();
    const upperDay = (finalYear === currentYear && finalMonthIndex === currentMonthIndex) 
      ? Math.min(maxAllowedDay, currentDay) 
      : maxAllowedDay;

    if (finalDay > upperDay) {
      finalDay = upperDay;
    }

    const yStr = String(finalYear);
    const mStr = String(finalMonthIndex + 1).padStart(2, "0");
    const dStr = String(finalDay).padStart(2, "0");
    const formatted = `${yStr}-${mStr}-${dStr}`;
    if (onChange) {
      onChange(formatted);
    }
    setIsOpen(false);
  };

  // Format display text (e.g. "24 Juni 1998")
  const displayString = useMemo(() => {
    if (!parsedDate) return "";
    const monthObj = MONTH_NAMES[parsedDate.monthIndex];
    const monthName = monthObj ? monthObj.full : "";
    return `${parsedDate.day} ${monthName} ${parsedDate.year}`;
  }, [parsedDate]);

  return (
    <div id={id} className={cn("w-full", className)}>
      <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
        {label}
      </label>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={`flex items-center justify-between w-full border-b py-1.5 cursor-pointer transition-colors ${
              error
                ? "border-red-500 dark:border-red-500"
                : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white focus-within:border-black dark:focus-within:border-white"
            }`}
          >
            <span
              className={cn(
                "text-sm",
                displayString
                  ? "text-zinc-900 dark:text-white font-medium"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              {displayString || placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 ml-2 flex-shrink-0" />
          </div>
        </PopoverTrigger>

        <PopoverContent
          data-lenis-prevent
          align="start"
          sideOffset={8}
          className="w-[300px] sm:w-[320px] p-4 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl z-50 text-zinc-900 dark:text-white animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mx-auto pl-4">
              SET BIRTHDAY
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Wheel Picker Container */}
          <div className="relative my-4 h-[180px] overflow-hidden select-none">
            {/* Middle Active Highlight Bar */}
            <div className="absolute top-[72px] left-0 right-0 h-9 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl pointer-events-none z-0" />

            {/* Top & Bottom Fade Gradient Overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white dark:from-[#121212] via-white/80 dark:via-[#121212]/80 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-[#121212] via-white/80 dark:via-[#121212]/80 to-transparent z-10" />

            {/* 3 Wheel Columns */}
            <div className="relative z-20 grid grid-cols-3 h-full gap-1">
              {/* Year Column */}
              <WheelColumn
                items={years}
                selectedValue={tempYear}
                onSelect={setTempYear}
                renderLabel={(y) => String(y)}
              />

              {/* Month Column */}
              <WheelColumn
                items={availableMonths}
                selectedValue={MONTH_NAMES[tempMonthIndex]}
                onSelect={(m) => setTempMonthIndex(m.index)}
                renderLabel={(m) => m.short}
              />

              {/* Day Column */}
              <WheelColumn
                items={days}
                selectedValue={tempDay}
                onSelect={setTempDay}
                renderLabel={(d) => String(d)}
              />
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
          >
            SUBMIT
          </button>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-semibold animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

// Helper WheelColumn Component with Smooth Scroll Alignment & Click Selection
interface WheelColumnProps<T> {
  items: T[];
  selectedValue: T;
  onSelect: (val: T) => void;
  renderLabel: (item: T) => string;
}

function WheelColumn<T>({
  items,
  selectedValue,
  onSelect,
  renderLabel,
}: WheelColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelected = (item: T) => {
    if (typeof item === "object" && item !== null && "index" in item && typeof selectedValue === "object" && selectedValue !== null && "index" in selectedValue) {
      return (item as any).index === (selectedValue as any).index;
    }
    return item === selectedValue;
  };

  // Scroll active item to middle on mount or when selectedValue changes
  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = items.findIndex((it) => isSelected(it));
    if (activeIndex !== -1) {
      const itemHeight = 36; // 36px per row
      const targetScrollTop = activeIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, [selectedValue, items]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto scrollbar-none py-[72px] space-y-0 text-center"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {items.map((item, idx) => {
        const selected = isSelected(item);
        return (
          <div
            key={idx}
            onClick={() => onSelect(item)}
            style={{ scrollSnapAlign: "center" }}
            className={cn(
              "h-9 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-150 rounded-lg",
              selected
                ? "text-zinc-900 dark:text-white font-bold scale-110"
                : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {renderLabel(item)}
          </div>
        );
      })}
    </div>
  );
}

DateBirthLine.displayName = "DateBirthLine";
