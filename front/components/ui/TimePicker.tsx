"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TimePickerProps {
  value?: string; // HH:MM or "selesai"
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function TimePicker({
  value = "",
  onChange,
  placeholder = "Pilih waktu",
  className,
  allowEmpty = false,
  emptyLabel = "Sampai Selesai",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Parse hour and minute from value (HH:MM)
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [selectedMinute, setSelectedMinute] = useState<string>("");

  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      setSelectedHour(h);
      setSelectedMinute(m);
    } else {
      setSelectedHour("");
      setSelectedMinute("");
    }
  }, [value]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  // Scroll to selected values when popover opens
  useEffect(() => {
    if (isOpen && value !== "selesai") {
      setTimeout(() => {
        if (selectedHour && hourRef.current) {
          const hourElement = hourRef.current.querySelector(
            `[data-hour="${selectedHour}"]`
          );
          if (hourElement) {
            hourElement.scrollIntoView({ block: "center", behavior: "auto" });
          }
        }
        if (selectedMinute && minuteRef.current) {
          const minuteElement = minuteRef.current.querySelector(
            `[data-minute="${selectedMinute}"]`
          );
          if (minuteElement) {
            minuteElement.scrollIntoView({ block: "center", behavior: "auto" });
          }
        }
      }, 50);
    }
  }, [isOpen, selectedHour, selectedMinute, value]);

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    const newMinute = selectedMinute || "00";
    setSelectedMinute(newMinute);
    if (onChange) {
      onChange(`${hour}:${newMinute}`);
    }
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    const newHour = selectedHour || "09";
    setSelectedHour(newHour);
    if (onChange) {
      onChange(`${newHour}:${minute}`);
    }
  };

  const formattedDisplay = value === "selesai"
    ? emptyLabel
    : (selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : "");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          translate="no"
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-bold cursor-pointer text-left notranslate",
            !formattedDisplay && "text-zinc-400 font-medium",
            className
          )}
        >
          <span className="notranslate" translate="no">{formattedDisplay || placeholder}</span>
          <Clock size={16} className="text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent data-lenis-prevent translate="no" className="w-[180px] p-3 z-[60] notranslate select-none" align="start">
        <div className="flex gap-2">
          {/* Hours Column */}
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block mb-2 text-center">
              Jam
            </span>
            <div
              ref={hourRef}
              className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1 no-scrollbar"
            >
              {hours.map((hour) => {
                const isSelected = selectedHour === hour && value !== "selesai";
                return (
                  <button
                    key={hour}
                    type="button"
                    data-hour={hour}
                    onClick={() => handleHourSelect(hour)}
                    className={cn(
                      "py-1.5 px-2 text-xs font-bold rounded-md text-center transition-colors cursor-pointer",
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    )}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-[1px] bg-zinc-200 dark:bg-zinc-800 self-stretch mt-6" />

          {/* Minutes Column */}
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider block mb-2 text-center">
              Menit
            </span>
            <div
              ref={minuteRef}
              className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1 no-scrollbar"
            >
              {minutes.map((minute) => {
                const isSelected = selectedMinute === minute && value !== "selesai";
                return (
                  <button
                    key={minute}
                    type="button"
                    data-minute={minute}
                    onClick={() => handleMinuteSelect(minute)}
                    className={cn(
                      "py-1.5 px-2 text-xs font-bold rounded-md text-center transition-colors cursor-pointer",
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    )}
                  >
                    {minute}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {allowEmpty && (
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setSelectedHour("");
                setSelectedMinute("");
                if (onChange) {
                  onChange("selesai");
                }
                setIsOpen(false);
              }}
              className={cn(
                "w-full py-1.5 px-2 text-xs font-bold text-center rounded-md transition-colors cursor-pointer border",
                value === "selesai"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent"
                  : "text-[#b91c1c] hover:bg-red-500/10 border-red-500/10"
              )}
            >
              {emptyLabel}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
