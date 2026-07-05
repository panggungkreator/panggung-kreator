"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const WEEKDAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"calendar" | "year-month">("calendar");
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date value
  const initialDate = value ? new Date(value) : null;
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate && !isNaN(initialDate.getTime()) ? initialDate : null
  );

  // Control which month is displayed in the calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || new Date()
  );

  // Sync state if value prop changes
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setCurrentMonth(parsed);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setView("calendar"); // reset view to calendar when closed
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    const formatted = formatDateToYYYYMMDD(date);
    if (onChange) {
      onChange(formatted);
    }
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setView("calendar");
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setView("calendar");
  };

  // Helper: Format to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Helper: Format display string (e.g., "28 Mei 2026")
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "";
    const d = date.getDate();
    const m = MONTH_NAMES[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  // Compute days grid
  const getDaysGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Index of the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Number of days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Number of days in previous month
    const prevTotalDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to complete grid rows
    const totalCellsNeeded = 42; // standard 6-row grid
    const nextMonthDaysToAdd = totalCellsNeeded - cells.length;
    for (let i = 1; i <= nextMonthDaysToAdd; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  };

  const daysGrid = getDaysGrid();

  // Generate years list (e.g., from current year back to 1930)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1930 + 1 },
    (_, i) => currentYear - i
  );

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-12 w-full items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-[#2c2c2c] transition-all hover:border-gray-300 focus:outline-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white font-bold",
            isOpen ? "ring-2 ring-gray-900 border-transparent" : "",
            className
          )}
        >
          <Calendar className="mr-3 h-5 w-5 text-gray-400 flex-shrink-0" />
          <span className={cn("flex-grow text-left", !selectedDate && "text-gray-400")}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent data-lenis-prevent className="w-[328px] p-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)] z-50" align="end" sideOffset={8}>
        {view === "calendar" ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setView("year-month")}
                className="px-3 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors dark:text-white dark:hover:bg-neutral-800"
              >
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-400 dark:text-neutral-500">
              {WEEKDAY_NAMES.map((name) => (
                <div key={name} className="py-1">
                  {name}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map((cell, idx) => {
                const dayIsSelected = isSelected(cell.date);
                const dayIsToday = isToday(cell.date);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDaySelect(cell.date)}
                    className={cn(
                      "h-9 w-9 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all focus:outline-none",
                      // Base colors depending on whether day belongs to current month
                      cell.isCurrentMonth
                        ? "text-gray-900 dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                        : "text-gray-300 dark:text-neutral-600 hover:bg-gray-50/50 dark:hover:bg-neutral-805/50 cursor-pointer",
                      // Today's style (not selected)
                      dayIsToday && !dayIsSelected
                        ? "border border-gray-950 dark:border-white font-bold"
                        : "",
                      // Selected style
                      dayIsSelected
                        ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950 font-bold shadow-xs hover:bg-gray-950 dark:hover:bg-white"
                        : ""
                    )}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* Year-Month Selection View */}
            <div className="flex items-center justify-between mb-4 border-b pb-2 dark:border-neutral-800">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Pilih Bulan & Tahun
              </span>
              <button
                type="button"
                onClick={() => setView("calendar")}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors dark:text-neutral-400 dark:hover:text-white font-bold"
              >
                Kembali
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[240px] overflow-y-auto pr-1">
              {/* Months Column */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                  Bulan
                </span>
                <div className="flex flex-col gap-1">
                  {MONTH_NAMES.map((name, idx) => {
                    const isCurrent = currentMonth.getMonth() === idx;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleMonthSelect(idx)}
                        className={cn(
                          "py-1.5 px-2 text-xs font-semibold rounded-md text-left transition-colors",
                          isCurrent
                            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                            : "text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-805"
                        )}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Years Column */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                  Tahun
                </span>
                <div className="flex flex-col gap-1 max-h-[190px] overflow-y-auto pr-1">
                  {years.map((year) => {
                    const isCurrent = currentMonth.getFullYear() === year;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={cn(
                          "py-1.5 px-2 text-xs font-semibold rounded-md text-center transition-colors",
                          isCurrent
                            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                            : "text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
