"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateBirthProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDate?: Date;
}

export function DateBirth({
  value,
  onChange,
  placeholder = "Pilih tanggal lahir",
  className,
  disabled = false,
  maxDate,
}: DateBirthProps) {
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }
  };

  const currentYear = new Date().getFullYear();
  const startMonth = new Date(1940, 0);
  const endMonth = maxDate || new Date(currentYear, 11);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between bg-transparent text-sm transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            className
          )}
        >
          <span
            className={cn(
              dateValue
                ? "text-zinc-900 dark:text-white font-medium"
                : "text-zinc-400 dark:text-zinc-500"
            )}
          >
            {dateValue ? format(dateValue, "dd MMMM yyyy") : placeholder}
          </span>
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-zinc-500 dark:text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
