import { formatDistanceToNow as formatDistanceToNowFns } from "date-fns";
import { de } from "date-fns/locale";
import { currentLanguage } from "../config/i18n";

/**
 * Get the date-fns locale based on the current language setting
 */
export function getDateLocale() {
  return currentLanguage === "de" ? de : undefined;
}

/**
 * Format distance to now with locale support
 */
export function formatDistanceToNow(
  date: Date,
  options?: { addSuffix?: boolean }
) {
  return formatDistanceToNowFns(date, {
    ...options,
    locale: getDateLocale(),
  });
}

/**
 * Format date with locale support
 */
export function formatDate(date: Date) {
  return date.toLocaleDateString(currentLanguage === "de" ? "de-DE" : "en-US");
}
