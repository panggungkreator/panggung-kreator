"use client";

import React from "react";
import { DateBirth } from "@/components/ui/datebirth";

export interface DatePickerLineProps {
  id?: string;
  label: string;
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
  placeholder?: string;
  maxDate?: Date;
}

export const DatePickerLine: React.FC<DatePickerLineProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = "Pilih tanggal lahir",
  maxDate,
}) => {
  return (
    <div id={id} className="w-full">
      <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
        {label}
      </label>
      <div
        className={`flex items-center w-full border-b transition-colors ${
          error
            ? "border-red-500 dark:border-red-500 focus-within:border-red-500"
            : "border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white focus-within:border-black dark:focus-within:border-white"
        }`}
      >
        <DateBirth
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxDate={maxDate}
          className="w-full py-1.5"
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-semibold animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

DatePickerLine.displayName = "DatePickerLine";
