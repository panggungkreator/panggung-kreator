export interface ValidationRules {
  [key: string]: string | Array<string | ((val: any) => string | null)>;
}

/**
 * Laravel-style Validation Engine for Frontend
 * 
 * Example usage:
 * const { passes, errors } = validate(
 *   { fullName, whatsappNumber, email },
 *   {
 *     fullName: "required|min:3",
 *     whatsappNumber: "required|phone",
 *     email: "email",
 *   },
 *   {
 *     "fullName.required": "Nama Lengkap wajib diisi!",
 *     "fullName.min": "Nama Lengkap minimal 3 karakter!",
 *     "whatsappNumber.required": "No. WhatsApp wajib diisi!",
 *     "whatsappNumber.phone": "No. WhatsApp harus antara 9 - 13 digit!",
 *     "email.email": "Format email tidak valid!",
 *   }
 * );
 */
export function validate(
  data: Record<string, any>,
  rules: ValidationRules,
  customMessages?: Record<string, string>
): {
  passes: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const rawVal = data[field];
    const value = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
    const fieldRules = rules[field];

    const parsedRules = typeof fieldRules === "string" 
      ? fieldRules.split("|") 
      : fieldRules;

    for (const ruleItem of parsedRules) {
      if (typeof ruleItem === "function") {
        const customError = ruleItem(rawVal);
        if (customError) {
          errors[field] = customError;
          break;
        }
        continue;
      }

      let ruleName = "";
      let ruleParam = "";

      if (ruleItem.includes(":")) {
        const parts = ruleItem.split(":");
        ruleName = parts[0];
        ruleParam = parts[1];
      } else {
        ruleName = ruleItem;
      }

      // 1. Required Rule
      if (ruleName === "required") {
        if (!value.trim()) {
          errors[field] = customMessages?.[`${field}.required`] || `${field} wajib diisi.`;
          break;
        }
      }

      // Skip remaining rules if value is empty and not required
      if (!value.trim() && ruleName !== "required") {
        continue;
      }

      // 2. Email Rule
      if (ruleName === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          errors[field] = customMessages?.[`${field}.email`] || "Format email tidak valid.";
          break;
        }
      }

      // 3. Min Rule
      if (ruleName === "min") {
        const minVal = parseInt(ruleParam, 10);
        if (value.trim().length < minVal) {
          errors[field] = customMessages?.[`${field}.min`] || `${field} minimal ${minVal} karakter.`;
          break;
        }
      }

      // 4. Max Rule
      if (ruleName === "max") {
        const maxVal = parseInt(ruleParam, 10);
        if (value.trim().length > maxVal) {
          errors[field] = customMessages?.[`${field}.max`] || `${field} maksimal ${maxVal} karakter.`;
          break;
        }
      }

      // 5. Phone / WhatsApp Rule
      if (ruleName === "phone") {
        const digits = value.replace(/\D/g, "");
        if (digits.length < 9 || digits.length > 13) {
          errors[field] = customMessages?.[`${field}.phone`] || "Nomor WhatsApp harus antara 9 - 13 digit.";
          break;
        }
      }

      // 6. No At Sign Rule (useful for social media usernames)
      if (ruleName === "no_at") {
        if (value.trim().startsWith("@")) {
          errors[field] = customMessages?.[`${field}.no_at`] || "Tulis username tanpa menggunakan '@'.";
          break;
        }
      }
    }
  }

  return {
    passes: Object.keys(errors).length === 0,
    errors,
  };
}
