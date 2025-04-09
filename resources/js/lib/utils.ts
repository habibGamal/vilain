import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and properly merges Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get theme class based on user preference
 */
export function getThemeClass(theme: string | null): string {
  return theme === 'dark' ? 'dark' : '';
}
