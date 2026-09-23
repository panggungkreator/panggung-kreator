"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type ValidationRule<T = any> = {
  value: T;
  label?: string;
  required?: boolean | string;
  minLength?: number | { length: number; message?: string };
  maxLength?: number | { length: number; message?: string };
  email?: boolean | string;
  url?: boolean | string;
  custom?: (value: T) => string | null | undefined;
};

export type ValidationSchema<K extends string = string> = Record<K, ValidationRule>;

export interface UseModalValidationOptions<K extends string = string> {
  initialErrors?: Partial<Record<K, string>>;
}

/**
 * Hook serbaguna untuk membungkus validasi modal/form di edit profile.
 * Menyediakan state errors, fungsi validasi, helper class input merah,
 * dan auto-clear error saat field diketik.
 */
export function useModalValidation<K extends string = string>(
  options?: UseModalValidationOptions<K>
) {
  const [errors, setErrors] = useState<Partial<Record<K, string>>>(
    options?.initialErrors || {}
  );

  // Menghapus error pada satu field tertentu
  const clearError = useCallback((field: K) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Menyetel error manual pada satu field
  const setError = useCallback((field: K, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  // Mereset semua error (misal saat modal dibuka/tutup)
  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Memeriksa apakah field memiliki error
  const hasError = useCallback(
    (field: K): boolean => {
      return !!errors[field];
    },
    [errors]
  );

  // Validasi deklaratif menggunakan schema aturan
  const validate = useCallback(
    (schema: ValidationSchema<K>): boolean => {
      const newErrors: Partial<Record<K, string>> = {};

      for (const key in schema) {
        const field = key as K;
        const rule = schema[field];
        if (!rule) continue;

        const val = rule.value;
        const label = rule.label || field;
        const strVal = typeof val === "string" ? val.trim() : val;

        // 1. Required check
        if (rule.required) {
          const isEmpty =
            strVal === undefined ||
            strVal === null ||
            strVal === "" ||
            (Array.isArray(strVal) && strVal.length === 0);

          if (isEmpty) {
            newErrors[field] =
              typeof rule.required === "string"
                ? rule.required
                : `${label} wajib diisi.`;
            continue;
          }
        }

        // Lewati aturan selanjutnya jika nilai kosong dan tidak wajib
        if (strVal === "" || strVal === undefined || strVal === null) {
          continue;
        }

        // 2. Email check
        if (rule.email && typeof strVal === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(strVal)) {
            newErrors[field] =
              typeof rule.email === "string"
                ? rule.email
                : "Format email tidak valid.";
            continue;
          }
        }

        // 3. URL check
        if (rule.url && typeof strVal === "string") {
          try {
            new URL(strVal);
          } catch {
            newErrors[field] =
              typeof rule.url === "string"
                ? rule.url
                : "Format URL / tautan tidak valid.";
            continue;
          }
        }

        // 4. MinLength check
        if (rule.minLength && typeof strVal === "string") {
          const min =
            typeof rule.minLength === "number"
              ? rule.minLength
              : rule.minLength.length;
          const msg =
            typeof rule.minLength === "object" && rule.minLength.message
              ? rule.minLength.message
              : `${label} minimal ${min} karakter.`;

          if (strVal.length < min) {
            newErrors[field] = msg;
            continue;
          }
        }

        // 5. MaxLength check
        if (rule.maxLength && typeof strVal === "string") {
          const max =
            typeof rule.maxLength === "number"
              ? rule.maxLength
              : rule.maxLength.length;
          const msg =
            typeof rule.maxLength === "object" && rule.maxLength.message
              ? rule.maxLength.message
              : `${label} maksimal ${max} karakter.`;

          if (strVal.length > max) {
            newErrors[field] = msg;
            continue;
          }
        }

        // 6. Custom validator check
        if (rule.custom) {
          const customError = rule.custom(val);
          if (customError) {
            newErrors[field] = customError;
            continue;
          }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );

  // Validasi fleksibel menggunakan object mapping kondisi manual
  const validateCustom = useCallback(
    (fieldErrors: Partial<Record<K, string | undefined | null | false>>): boolean => {
      const newErrors: Partial<Record<K, string>> = {};

      for (const key in fieldErrors) {
        const errorMsg = fieldErrors[key];
        if (errorMsg && typeof errorMsg === "string") {
          newErrors[key] = errorMsg;
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    []
  );

  // Helper class untuk border input (merah saat error, normal saat valid)
  const getInputClassName = useCallback(
    (
      field: K,
      baseClass: string = "w-full bg-bg-well/60 border px-3.5 py-2 text-xs sm:text-sm rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors",
      options?: {
        errorBorder?: string;
        normalBorder?: string;
      }
    ) => {
      const isError = !!errors[field];
      const errorBorder = options?.errorBorder || "border-red-500 focus:border-red-500";
      const normalBorder = options?.normalBorder || "border-border-default focus:border-text-primary";

      return cn(baseClass, isError ? errorBorder : normalBorder);
    },
    [errors]
  );

  // Helper onChange yang otomatis mengubah nilai state dan menghapus pesan error
  const createChangeHandler = useCallback(
    <T = string>(field: K, stateSetter: (val: T) => void) => {
      return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | T) => {
        const val = (e && typeof e === "object" && "target" in e ? (e as any).target.value : e) as T;
        stateSetter(val);
        clearError(field);
      };
    },
    [clearError]
  );

  return {
    errors,
    setErrors,
    clearError,
    setError,
    resetErrors,
    hasError,
    validate,
    validateCustom,
    getInputClassName,
    createChangeHandler,
  };
}

/**
 * Komponen reusable untuk menampilkan pesan warning merah di bawah input
 */
export function FieldError({
  error,
  className,
}: {
  error?: string | null;
  className?: string;
}) {
  if (!error) return null;

  return (
    <p
      className={cn(
        "mt-1.5 text-xs text-red-500 font-medium animate-fade-in",
        className
      )}
    >
      {error}
    </p>
  );
}
