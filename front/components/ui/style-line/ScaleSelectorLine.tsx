import React from "react";

export interface ScaleSelectorLineProps {
  id?: string;
  label: string;
  min?: number;
  max: number;
  value: number | null;
  onChange: (val: number) => void;
  minLabel?: string;
  maxLabel?: string;
  error?: string;
  className?: string;
}

export const ScaleSelectorLine: React.FC<ScaleSelectorLineProps> = ({
  id,
  label,
  min = 1,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
  error,
  className = "",
}) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const gridColsClass = max === 5 ? "grid-cols-5" : max === 10 ? "grid-cols-10" : "grid-cols-5";

  return (
    <div id={id} className={`w-full ${className}`}>
      <label className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase block mb-2">
        {label}
      </label>

      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-2">
          <span>{minLabel || ""}</span>
          <span>{maxLabel || ""}</span>
        </div>
      )}

      <div className={`grid ${gridColsClass} gap-1.5`}>
        {options.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`py-2 text-xs font-bold font-mono transition-all border cursor-pointer ${
              value === val
                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                : "bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-white"
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-semibold animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};
