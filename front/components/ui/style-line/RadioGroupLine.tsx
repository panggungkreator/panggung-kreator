import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface RadioGroupLineProps {
  id?: string;
  label: string;
  options: string[];
  value: string;
  onValueChange: (val: string) => void;
  customTriggerValue?: string;
  customValue?: string;
  onCustomChange?: (val: string) => void;
  customPlaceholder?: string;
  idPrefix: string;
  error?: string;
  className?: string;
}

export const RadioGroupLine: React.FC<RadioGroupLineProps> = ({
  id,
  label,
  options,
  value,
  onValueChange,
  customTriggerValue = "Lainnya",
  customValue = "",
  onCustomChange,
  customPlaceholder = "Tuliskan jawabanmu...",
  idPrefix,
  error,
  className = "",
}) => {
  return (
    <div id={id} className={`w-full ${className}`}>
      <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
        {label}
      </label>
      <RadioGroup value={value} onValueChange={onValueChange} className="space-y-2">
        {options.map((opt) => {
          const itemId = `${idPrefix}-${opt}`;
          return (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem
                value={opt}
                id={itemId}
                className="border-zinc-400 dark:border-zinc-600 text-black dark:text-white"
              />
              <Label htmlFor={itemId} className="cursor-pointer text-xs text-zinc-800 dark:text-zinc-200">
                {opt}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {value === customTriggerValue && onCustomChange && (
        <input
          type="text"
          placeholder={customPlaceholder}
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-1 text-xs focus:outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
        />
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-semibold animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
