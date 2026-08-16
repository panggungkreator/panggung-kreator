import React from "react";

export interface MultiSelectLineProps {
  id?: string;
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  maxSelect?: number;
  showRemaining?: boolean;
  customTriggerValue?: string;
  customValue?: string;
  onCustomChange?: (val: string) => void;
  customPlaceholder?: string;
  error?: string;
  className?: string;
}

export const MultiSelectLine: React.FC<MultiSelectLineProps> = ({
  id,
  label,
  options,
  selected,
  onToggle,
  maxSelect,
  showRemaining = false,
  customTriggerValue = "Lainnya",
  customValue = "",
  onCustomChange,
  customPlaceholder = "Tuliskan lainnya...",
  error,
  className = "",
}) => {
  return (
    <div id={id} className={`w-full ${className}`}>
      <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-1">
        {label}
      </label>

      {showRemaining && maxSelect !== undefined && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-3">
          Tersisa {maxSelect - selected.length} pilihan
        </span>
      )}

      <div className="space-y-2">
        {options.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`w-full text-left p-3 border text-xs transition-all outline-none rounded-none cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-semibold"
                  : "bg-transparent border-zinc-250 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white"
              }`}
            >
              <span>{item}</span>
              {isSelected && <span className="font-mono text-[10px] uppercase">[✓]</span>}
            </button>
          );
        })}
      </div>

      {selected.includes(customTriggerValue) && onCustomChange && (
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
