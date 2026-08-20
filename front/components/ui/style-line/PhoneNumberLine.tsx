import React, { useState, useEffect } from "react";
import { InputLine } from "./InputLine";

export interface PhoneNumberLineProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (formattedVal: string) => void;
  error?: string;
  placeholder?: string;
  focusClassName?: string;
}

export const PhoneNumberLine: React.FC<PhoneNumberLineProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder = "0812-3456-7890",
  focusClassName,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formatPhoneNumber = (val: string): string => {
    let cleaned = val.replace(/\D/g, "");
    if (cleaned.length > 0 && cleaned[0] !== "0") {
      cleaned = "0" + cleaned;
    }
    cleaned = cleaned.slice(0, 13);

    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
    if (cleaned.length > 4) parts.push(cleaned.slice(4, 8));
    if (cleaned.length > 8) parts.push(cleaned.slice(8, 13));

    return parts.join("-");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  return (
    <InputLine
      id={id}
      name={name}
      label={label}
      type="tel"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleInputChange}
      error={error}
      focusClassName={focusClassName}
    />
  );
};
