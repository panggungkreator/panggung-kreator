import React, { forwardRef } from "react";

export interface InputLineProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefixText?: string;
  focusClassName?: string;
}

export const InputLine = forwardRef<HTMLInputElement, InputLineProps>(
  ({ label, error, prefixText, className = "", focusClassName, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
          {label}
        </label>
        <div className={`flex items-center w-full border-b transition-colors ${
          error
            ? "border-red-500 dark:border-red-500 focus-within:border-red-500 dark:focus-within:border-red-500"
            : `border-zinc-300 dark:border-zinc-700 ${focusClassName || "focus-within:border-black dark:focus-within:border-white"}`
        }`}>
          {prefixText && (
            <span className="text-zinc-400 dark:text-zinc-500 mr-1 select-none text-sm py-1.5">
              {prefixText}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-transparent py-1.5 text-sm rounded-none focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-semibold animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputLine.displayName = "InputLine";
