import React, { forwardRef } from "react";

export interface TextareaLineProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label: string;
  hint?: string;
  rows?: number;
  error?: string;
  className?: string;
}

export const TextareaLine = forwardRef<HTMLTextAreaElement, TextareaLineProps>(
  ({ id, label, hint, rows = 3, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
          {label}
        </label>

        {hint && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-2">
            {hint}
          </span>
        )}

        <textarea
          ref={ref}
          id={id || props.name}
          rows={rows}
          className={`w-full bg-transparent border p-2.5 text-xs rounded-none focus:outline-none transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white ${
            error
              ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
              : "border-zinc-300 dark:border-zinc-700 focus:border-black dark:focus:border-white"
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-semibold animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaLine.displayName = "TextareaLine";
