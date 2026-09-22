"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateBirthLineProps {
  id?: string;
  value?: string; // Format: YYYY-MM-DD
  onChange?: (val: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  variant?: "line" | "box";
  disabled?: boolean;
  minDate?: string; // Format: YYYY-MM-DD
  maxDate?: string; // Format: YYYY-MM-DD
  title?: string;
  allowFuture?: boolean;
}

const MONTH_NAMES = [
  { short: "Jan", full: "Januari", index: 0 },
  { short: "Feb", full: "Februari", index: 1 },
  { short: "Mar", full: "Maret", index: 2 },
  { short: "Apr", full: "April", index: 3 },
  { short: "Mei", full: "Mei", index: 4 },
  { short: "Jun", full: "Juni", index: 5 },
  { short: "Jul", full: "Juli", index: 6 },
  { short: "Agu", full: "Agustus", index: 7 },
  { short: "Sep", full: "September", index: 8 },
  { short: "Okt", full: "Oktober", index: 9 },
  { short: "Nov", full: "November", index: 10 },
  { short: "Des", full: "Desember", index: 11 },
];

const parseDateString = (str?: string) => {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { year: y, monthIndex: m, day: d };
    }
  }
  return null;
};

export const DateBirthLine: React.FC<DateBirthLineProps> = ({
  id,
  value,
  onChange,
  error,
  placeholder = "Pilih tanggal lahir",
  className = "",
  variant = "line",
  disabled = false,
  minDate,
  maxDate,
  title,
  allowFuture = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const parsedDate = useMemo(() => parseDateString(value), [value]);
  const parsedMin = useMemo(() => parseDateString(minDate), [minDate]);
  const parsedMax = useMemo(() => parseDateString(maxDate), [maxDate]);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const currentDay = today.getDate();

  const maxAllowedYear = useMemo(() => {
    if (parsedMax) return parsedMax.year;
    if (allowFuture) return currentYear + 10;
    return currentYear;
  }, [parsedMax, allowFuture, currentYear]);

  const minAllowedYear = useMemo(() => {
    if (parsedMin) return parsedMin.year;
    return 1940;
  }, [parsedMin]);

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
        let defY = currentYear;
        if (defY > maxAllowedYear) defY = maxAllowedYear;
        if (defY < minAllowedYear) defY = minAllowedYear;

        let defM = currentMonthIndex;
        if (parsedMax && defY === parsedMax.year && defM > parsedMax.monthIndex) {
          defM = parsedMax.monthIndex;
        } else if (!allowFuture && !parsedMax && defY === currentYear && defM > currentMonthIndex) {
          defM = currentMonthIndex;
        }
        if (parsedMin && defY === parsedMin.year && defM < parsedMin.monthIndex) {
          defM = parsedMin.monthIndex;
        }

        let defD = currentDay;
        const totalD = new Date(defY, defM + 1, 0).getDate();
        let maxD = totalD;
        if (parsedMax && defY === parsedMax.year && defM === parsedMax.monthIndex) {
          maxD = Math.min(maxD, parsedMax.day);
        } else if (!allowFuture && !parsedMax && defY === currentYear && defM === currentMonthIndex) {
          maxD = Math.min(maxD, currentDay);
        }
        let minD = 1;
        if (parsedMin && defY === parsedMin.year && defM === parsedMin.monthIndex) {
          minD = parsedMin.day;
        }
        defD = Math.max(minD, Math.min(maxD, defD));

        setTempYear(defY);
        setTempMonthIndex(defM);
        setTempDay(defD);
      }
    }
  }, [isOpen, parsedDate, maxAllowedYear, minAllowedYear, parsedMax, parsedMin, allowFuture, currentYear, currentMonthIndex, currentDay]);

  // Generate list of years
  const years = useMemo(() => {
    const list: number[] = [];
    const high = Math.max(maxAllowedYear, minAllowedYear);
    const low = Math.min(maxAllowedYear, minAllowedYear);
    for (let y = high; y >= low; y--) {
      list.push(y);
    }
    return list.length > 0 ? list : [currentYear];
  }, [maxAllowedYear, minAllowedYear, currentYear]);

  // Available months
  const availableMonths = useMemo(() => {
    return MONTH_NAMES.filter((m) => {
      if (parsedMin && tempYear === parsedMin.year && m.index < parsedMin.monthIndex) {
        return false;
      }
      if (parsedMax && tempYear === parsedMax.year && m.index > parsedMax.monthIndex) {
        return false;
      }
      if (!allowFuture && !parsedMax && tempYear === currentYear && m.index > currentMonthIndex) {
        return false;
      }
      return true;
    });
  }, [tempYear, parsedMin, parsedMax, allowFuture, currentYear, currentMonthIndex]);

  // Max and Min days in selected month/year
  const maxDays = useMemo(() => {
    const totalDays = new Date(tempYear, tempMonthIndex + 1, 0).getDate();
    let maxD = totalDays;
    if (parsedMax && tempYear === parsedMax.year && tempMonthIndex === parsedMax.monthIndex) {
      maxD = Math.min(maxD, parsedMax.day);
    } else if (!allowFuture && !parsedMax && tempYear === currentYear && tempMonthIndex === currentMonthIndex) {
      maxD = Math.min(maxD, currentDay);
    }
    return maxD;
  }, [tempYear, tempMonthIndex, parsedMax, allowFuture, currentYear, currentMonthIndex, currentDay]);

  const minDay = useMemo(() => {
    if (parsedMin && tempYear === parsedMin.year && tempMonthIndex === parsedMin.monthIndex) {
      return parsedMin.day;
    }
    return 1;
  }, [tempYear, tempMonthIndex, parsedMin]);

  // Generate list of days
  const days = useMemo(() => {
    const list: number[] = [];
    for (let d = minDay; d <= maxDays; d++) {
      list.push(d);
    }
    return list.length > 0 ? list : [minDay];
  }, [minDay, maxDays]);

  // Adjust tempYear if outside range
  useEffect(() => {
    if (tempYear > maxAllowedYear) setTempYear(maxAllowedYear);
    else if (tempYear < minAllowedYear) setTempYear(minAllowedYear);
  }, [tempYear, maxAllowedYear, minAllowedYear]);

  // Adjust tempMonthIndex if it exceeds available months
  useEffect(() => {
    if (availableMonths.length > 0) {
      const isAvailable = availableMonths.some((m) => m.index === tempMonthIndex);
      if (!isAvailable) {
        if (tempMonthIndex < availableMonths[0].index) {
          setTempMonthIndex(availableMonths[0].index);
        } else {
          setTempMonthIndex(availableMonths[availableMonths.length - 1].index);
        }
      }
    }
  }, [availableMonths, tempMonthIndex]);

  // Adjust tempDay if outside range
  useEffect(() => {
    if (tempDay > maxDays) {
      setTempDay(maxDays);
    } else if (tempDay < minDay) {
      setTempDay(minDay);
    }
  }, [maxDays, minDay, tempDay]);

  const handleSubmit = () => {
    let finalYear = tempYear;
    let finalMonthIndex = tempMonthIndex;
    let finalDay = tempDay;

    if (finalYear > maxAllowedYear) finalYear = maxAllowedYear;
    if (finalYear < minAllowedYear) finalYear = minAllowedYear;

    const availableForFinalYear = MONTH_NAMES.filter((m) => {
      if (parsedMin && finalYear === parsedMin.year && m.index < parsedMin.monthIndex) return false;
      if (parsedMax && finalYear === parsedMax.year && m.index > parsedMax.monthIndex) return false;
      if (!allowFuture && !parsedMax && finalYear === currentYear && m.index > currentMonthIndex) return false;
      return true;
    });

    if (availableForFinalYear.length > 0) {
      const isAvailable = availableForFinalYear.some((m) => m.index === finalMonthIndex);
      if (!isAvailable) {
        if (finalMonthIndex < availableForFinalYear[0].index) {
          finalMonthIndex = availableForFinalYear[0].index;
        } else {
          finalMonthIndex = availableForFinalYear[availableForFinalYear.length - 1].index;
        }
      }
    }

    const totalDays = new Date(finalYear, finalMonthIndex + 1, 0).getDate();
    let maxD = totalDays;
    if (parsedMax && finalYear === parsedMax.year && finalMonthIndex === parsedMax.monthIndex) {
      maxD = Math.min(maxD, parsedMax.day);
    } else if (!allowFuture && !parsedMax && finalYear === currentYear && finalMonthIndex === currentMonthIndex) {
      maxD = Math.min(maxD, currentDay);
    }
    let minD = 1;
    if (parsedMin && finalYear === parsedMin.year && finalMonthIndex === parsedMin.monthIndex) {
      minD = parsedMin.day;
    }

    finalDay = Math.max(minD, Math.min(maxD, finalDay));

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
    <div id={id} className={cn("w-full notranslate", className)} translate="no">
      <Popover open={disabled ? false : isOpen} onOpenChange={(open) => !disabled && setIsOpen(open)}>
        <PopoverTrigger asChild>
          <div
            className={
              variant === "box"
                ? `flex items-center justify-between w-full h-10 px-3.5 bg-[#F6F5FA]/60 dark:bg-neutral-900/60 border rounded-xl transition-all notranslate ${
                    disabled
                      ? "opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800"
                      : error
                      ? "border-red-500 cursor-pointer"
                      : "border-[#212121]/10 dark:border-white/10 hover:border-[#212121]/30 dark:hover:border-white/30 cursor-pointer"
                  }`
                : `flex items-center justify-between w-full border-b py-1.5 transition-colors notranslate ${
                    disabled
                      ? "opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                      : error
                      ? "border-red-500 dark:border-red-500 cursor-pointer"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white focus-within:border-black dark:focus-within:border-white cursor-pointer"
                  }`
            }
            translate="no"
          >
            <span
              className={cn(
                variant === "box" ? "text-xs font-medium notranslate" : "text-sm notranslate",
                displayString
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
              translate="no"
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
          translate="no"
          className="w-[300px] sm:w-[320px] p-4 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl z-50 text-zinc-900 dark:text-white animate-fade-in notranslate select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mx-auto pl-4">
              {title || "PILIH TANGGAL"}
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
          <div className="relative my-4 h-[180px] overflow-hidden select-none notranslate" translate="no">
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
                renderLabel={(m) => m.full}
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
            PILIH TANGGAL
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

// Helper WheelColumn Component with Smooth Scroll Alignment, Auto-Selection on Scroll & Click Selection
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
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const programmaticTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);

  const isSelected = (item: T) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "index" in item &&
      typeof selectedValue === "object" &&
      selectedValue !== null &&
      "index" in selectedValue
    ) {
      return (item as any).index === (selectedValue as any).index;
    }
    return item === selectedValue;
  };

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const isSelectedRef = useRef(isSelected);
  isSelectedRef.current = isSelected;

  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => {
    const idx = items.findIndex((it) => isSelected(it));
    return idx !== -1 ? idx : 0;
  });

  const itemHeight = 36; // 36px per row (h-9)

  const commitSelection = (index: number) => {
    if (index >= 0 && index < itemsRef.current.length) {
      const item = itemsRef.current[index];
      if (item !== undefined && !isSelectedRef.current(item)) {
        onSelectRef.current(item);
      }
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const currentScrollTop = containerRef.current.scrollTop;
    const currentIndex = Math.max(
      0,
      Math.min(itemsRef.current.length - 1, Math.round(currentScrollTop / itemHeight))
    );

    setHighlightedIndex(currentIndex);

    if (isProgrammaticScrollRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      commitSelection(currentIndex);
    }, 80);
  };

  const handleScrollEnd = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }
    if (!containerRef.current) return;
    const currentIndex = Math.max(
      0,
      Math.min(itemsRef.current.length - 1, Math.round(containerRef.current.scrollTop / itemHeight))
    );
    setHighlightedIndex(currentIndex);
    commitSelection(currentIndex);
  };

  // Scroll active item to middle on mount or when selectedValue changes
  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = items.findIndex((it) => isSelected(it));
    if (activeIndex !== -1) {
      setHighlightedIndex(activeIndex);
      const targetScrollTop = activeIndex * itemHeight;

      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
        isProgrammaticScrollRef.current = true;
        containerRef.current.scrollTop = targetScrollTop;
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = targetScrollTop;
          }
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 50);
        });
        return;
      }

      // Only scroll if container is not already positioned at target
      if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 1) {
        isProgrammaticScrollRef.current = true;
        if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 400);

        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
    }
  }, [selectedValue, items]);

  // Attach native scrollend listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scrollend", handleScrollEnd);
    return () => {
      container.removeEventListener("scrollend", handleScrollEnd);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
    };
  }, []);

  const handleClick = (item: T, idx: number) => {
    setHighlightedIndex(idx);
    onSelectRef.current(item);
    if (containerRef.current) {
      const targetScrollTop = idx * itemHeight;
      if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 1) {
        isProgrammaticScrollRef.current = true;
        if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
        programmaticTimerRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 400);

        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto scrollbar-none py-[72px] space-y-0 text-center notranslate"
      translate="no"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {items.map((item, idx) => {
        const selected = idx === highlightedIndex;
        return (
          <div
            key={idx}
            onClick={() => handleClick(item, idx)}
            translate="no"
            style={{ scrollSnapAlign: "center" }}
            className={cn(
              "h-9 flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-150 rounded-lg notranslate",
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
