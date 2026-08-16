import { validate, ValidationRules } from "./validator";

export type ValidationMessages = Record<string, string>;
export type FieldErrors = Record<string, string>;

/**
 * Validates a single field against a set of rules and custom error messages.
 */
export function getFieldError(
  fieldName: string,
  value: string,
  rules: ValidationRules,
  messages: ValidationMessages
): string {
  const rule = rules[fieldName];
  if (!rule) return "";

  const { errors } = validate(
    { [fieldName]: value },
    { [fieldName]: rule },
    messages
  );
  return errors[fieldName] || "";
}

/**
 * Validates all specified fields in data using rules and messages.
 */
export function validateFields(
  data: Record<string, any>,
  rules: ValidationRules,
  messages: ValidationMessages
): { passes: boolean; errors: FieldErrors } {
  return validate(data, rules, messages);
}

/**
 * Merges multiple field error objects into one.
 */
export function mergeErrors(...errorMaps: FieldErrors[]): FieldErrors {
  return Object.assign({}, ...errorMaps);
}

/**
 * Removes error for a specific field name.
 */
export function clearFieldError(errors: FieldErrors, fieldName: string): FieldErrors {
  const next = { ...errors };
  delete next[fieldName];
  return next;
}

/**
 * Scrolls smoothly to the first element with a validation error or specified field name.
 */
export function scrollToFirstError(firstErrorField?: string): void {
  if (typeof window === "undefined") return;

  setTimeout(() => {
    let targetEl: HTMLElement | null = null;

    if (firstErrorField) {
      targetEl =
        document.getElementById(firstErrorField) ||
        document.querySelector<HTMLElement>(`[name="${firstErrorField}"]`) ||
        document.querySelector<HTMLElement>(`[data-field="${firstErrorField}"]`);
    }

    if (!targetEl) {
      // Look for any element containing red text (error message) or error border
      targetEl = document.querySelector<HTMLElement>(".text-red-500, .border-red-500, [data-error='true']");
    }

    if (targetEl) {
      const elementRect = targetEl.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const yOffset = -120; // Gap at top for comfortable padding and sticky headers

      window.scrollTo({
        top: Math.max(0, absoluteElementTop + yOffset),
        behavior: "smooth",
      });

      // Focus input if available
      const inputEl =
        targetEl.tagName === "INPUT" || targetEl.tagName === "TEXTAREA" || targetEl.tagName === "SELECT"
          ? targetEl
          : targetEl.querySelector<HTMLElement>("input, textarea, select");

      if (inputEl && typeof inputEl.focus === "function") {
        inputEl.focus({ preventScroll: true });
      }
    }
  }, 50);
}

