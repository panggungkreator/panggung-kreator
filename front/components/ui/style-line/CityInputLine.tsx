import React, { useState, useEffect } from "react";
import { InputLine } from "./InputLine";

export interface CityInputLineProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  citiesList: { id: string; name: string }[];
}

export const CityInputLine: React.FC<CityInputLineProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder = "Cari Kota / Kabupaten...",
  citiesList,
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredCities, setFilteredCities] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val);

    if (val.trim() === "") {
      setFilteredCities([]);
    } else {
      const query = val.toLowerCase();
      const filtered = citiesList
        .filter((item) => item.name.toLowerCase().includes(query))
        .slice(0, 10);
      setFilteredCities(filtered);
    }
  };

  const handleSelectCity = (cityName: string) => {
    onChange(cityName);
    setSearchQuery(cityName);
    setFilteredCities([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <InputLine
        id={id}
        name={name}
        label={label}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        error={error}
      />
      {showDropdown && filteredCities.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-md divide-y divide-zinc-150 dark:divide-zinc-850 animate-fade-in">
          {filteredCities.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectCity(item.name)}
              className="w-full text-left px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
