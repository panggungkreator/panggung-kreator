"use client";

import React, { createContext, useContext, useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectLineContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
}

const SelectLineContext = createContext<SelectLineContextType | null>(null);

export interface SelectLineOption {
  value: string;
  label: string;
}

export interface SelectLineProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options?: SelectLineOption[];
  children?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  error?: string;
  disabled?: boolean;
  prefixIcon?: React.ReactNode;
}

export const SelectLine: React.FC<SelectLineProps> = ({
  label,
  placeholder = "Pilih opsi...",
  value,
  onValueChange,
  options,
  children,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  error,
  disabled = false,
  prefixIcon,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync selected label when options are provided
  useEffect(() => {
    if (options) {
      const match = options.find((opt) => opt.value === value);
      if (match) {
        setSelectedLabel(match.label);
      } else if (!value) {
        setSelectedLabel("");
      }
    }
  }, [value, options]);

  return (
    <SelectLineContext.Provider
      value={{
        value,
        onValueChange,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
        triggerRef,
        disabled,
      }}
    >
      <div className={cn("relative w-full", className)}>
        {label && (
          <label className="text-[11px] font-bold font-mono tracking-[0.2em] text-[#666666] dark:text-zinc-400 uppercase block mb-1">
            {label}
          </label>
        )}

        {options ? (
          <>
            <SelectLineTrigger
              error={error}
              prefixIcon={prefixIcon}
              className={triggerClassName}
            >
              <SelectLineValue placeholder={placeholder} />
            </SelectLineTrigger>
            <SelectLineContent className={contentClassName}>
              {options.map((opt) => (
                <SelectLineItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectLineItem>
              ))}
            </SelectLineContent>
          </>
        ) : (
          children
        )}

        {error && (
          <p className="mt-1 text-xs text-red-500 font-mono tracking-wider">
            [ {error} ]
          </p>
        )}
      </div>
    </SelectLineContext.Provider>
  );
};

export interface SelectLineTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  error?: string;
  prefixIcon?: React.ReactNode;
}

export const SelectLineTrigger = forwardRef<HTMLButtonElement, SelectLineTriggerProps>(
  ({ className, children, error, prefixIcon, ...props }, forwardedRef) => {
    const context = useContext(SelectLineContext);
    if (!context) throw new Error("SelectLineTrigger must be used within SelectLine");

    const { open, setOpen, triggerRef, disabled } = context;

    // Use internal ref or forwarded ref
    const handleRef = (el: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    return (
      <button
        ref={handleRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between bg-transparent border-b py-1.5 px-0 text-xs font-mono uppercase tracking-wider rounded-none cursor-pointer transition-colors focus:outline-none appearance-none disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-500 focus:border-red-500"
            : "border-zinc-200 dark:border-zinc-800 hover:border-[#2c2c2c] dark:hover:border-white focus:border-[#2c2c2c] dark:focus:border-white",
          open && "border-[#2c2c2c] dark:border-white",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 truncate text-left flex-1 min-w-0">
          {prefixIcon && <span className="shrink-0 text-[#666666]">{prefixIcon}</span>}
          {children}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-[#666666] dark:text-neutral-400 shrink-0 ml-2 transition-transform duration-200",
            open && "rotate-180 text-[#2c2c2c] dark:text-white"
          )}
        />
      </button>
    );
  }
);
SelectLineTrigger.displayName = "SelectLineTrigger";

export function SelectLineValue({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const context = useContext(SelectLineContext);
  if (!context) throw new Error("SelectLineValue must be used within SelectLine");

  const { selectedLabel, value } = context;
  const display = selectedLabel || value;

  return (
    <span
      className={cn(
        "block truncate text-left text-xs font-mono",
        display
          ? "text-[#2c2c2c] dark:text-white font-medium"
          : "text-[#666666] dark:text-zinc-500",
        className
      )}
    >
      {display || placeholder || ""}
    </span>
  );
}

export function SelectLineContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" }) {
  const context = useContext(SelectLineContext);
  if (!context) throw new Error("SelectLineContent must be used within SelectLine");

  const { open, setOpen, triggerRef } = context;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        open &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (open && event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, triggerRef]);

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        "absolute z-50 max-h-60 w-full overflow-y-auto bg-white dark:bg-[#121212] border border-[#2c2c2c] dark:border-neutral-700 p-0 rounded-none shadow-none",
        side === "top" ? "bottom-full mb-1" : "top-full mt-1",
        open ? "block animate-in fade-in-0 duration-100" : "hidden",
        className
      )}
      {...props}
    >
      <div className="divide-y divide-neutral-100 dark:divide-neutral-900">{children}</div>
    </div>
  );
}

export function SelectLineItem({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = useContext(SelectLineContext);
  if (!context) throw new Error("SelectLineItem must be used within SelectLine");

  const { value: selectedValue, onValueChange, setOpen, setSelectedLabel } = context;
  const isSelected = selectedValue === value;

  useEffect(() => {
    if (isSelected && children) {
      setSelectedLabel(children.toString());
    }
  }, [isSelected, children, setSelectedLabel]);

  const handleSelect = () => {
    if (onValueChange) {
      onValueChange(value);
    }
    if (children) {
      setSelectedLabel(children.toString());
    }
    setOpen(false);
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between py-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors outline-none rounded-none",
        isSelected
          ? "bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c] font-bold"
          : "text-[#2c2c2c] dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900",
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <Check size={13} className="shrink-0 ml-2" />
      )}
    </div>
  );
}
