"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = createContext<SelectContextType | null>(null);

export function Select({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
        triggerRef,
      }}
    >
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  const { open, setOpen, triggerRef } = context;

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-full border border-border-default bg-bg-well px-4 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-text-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 text-text-secondary opacity-50 shrink-0 ml-2" />
    </button>
  );
}

export function SelectValue({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  const { selectedLabel, value } = context;

  return (
    <span className={cn("block truncate text-left", className)}>
      {selectedLabel || placeholder || value || ""}
    </span>
  );
}

export function SelectContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" }) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, triggerRef]);

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 max-h-60 w-full overflow-y-auto rounded-2xl border border-border-default bg-bg-card p-1 shadow-lg",
        side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        open ? "block animate-in fade-in-0 zoom-in-95 duration-105" : "hidden",
        className
      )}
      {...props}
    >
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function SelectItem({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

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
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-2 text-xs font-semibold text-text-secondary hover:bg-bg-well hover:text-text-primary outline-none transition-colors",
        isSelected && "bg-bg-well text-text-primary font-bold",
        className
      )}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-3.5 w-3.5 text-text-primary" />
        </span>
      )}
      <span className="truncate">{children}</span>
    </div>
  );
}
