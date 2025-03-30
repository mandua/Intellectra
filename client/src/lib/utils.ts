import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays } from "date-fns";

/**
 * Combines tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format a time
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Get the number of days until a date
 */
export function getDaysUntil(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  // Reset hours to compare just the dates
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(targetDate);
  compareDate.setHours(0, 0, 0, 0);
  
  return differenceInDays(compareDate, today);
}

/**
 * Get text for days until date
 */
export function getDaysUntilText(date: Date | string): { text: string, isUrgent: boolean } {
  const days = getDaysUntil(date);
  
  if (days < 0) {
    return { text: 'Past due', isUrgent: true };
  } else if (days === 0) {
    return { text: 'Today', isUrgent: true };
  } else if (days === 1) {
    return { text: 'Tomorrow', isUrgent: true };
  } else if (days <= 7) {
    return { text: `In ${days} days`, isUrgent: true };
  } else {
    return { text: `In ${days} days`, isUrgent: false };
  }
}

/**
 * Generate a random color from a subject name
 */
export function getSubjectColor(subject: string): string {
  const colors = [
    'text-blue-600 bg-blue-100 dark:bg-blue-800/30 dark:text-blue-300',
    'text-emerald-600 bg-emerald-100 dark:bg-emerald-800/30 dark:text-emerald-300',
    'text-purple-600 bg-purple-100 dark:bg-purple-800/30 dark:text-purple-300',
    'text-amber-600 bg-amber-100 dark:bg-amber-800/30 dark:text-amber-300',
    'text-rose-600 bg-rose-100 dark:bg-rose-800/30 dark:text-rose-300',
    'text-teal-600 bg-teal-100 dark:bg-teal-800/30 dark:text-teal-300',
  ];
  
  // Generate a simple hash from the subject name
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = ((hash << 5) - hash) + subject.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Get a positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Format a duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Priority badge classes
 */
export function getPriorityClasses(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Convert a date object to a time string (HH:MM)
 */
export function dateToTimeString(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Get productivity time block label
 */
export function getTimeBlockLabel(index: number): string {
  const timeBlocks = ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM', '6-9 PM', '9-12 AM'];
  return timeBlocks[index % timeBlocks.length];
}

/**
 * Calculate mastery level label and color
 */
export function getMasteryInfo(masteryLevel: number): { label: string, color: string } {
  if (masteryLevel >= 80) {
    return { 
      label: 'Mastered', 
      color: 'text-emerald-600 dark:text-emerald-400'
    };
  } else if (masteryLevel >= 60) {
    return { 
      label: 'Good progress', 
      color: 'text-blue-600 dark:text-blue-400'
    };
  } else if (masteryLevel >= 40) {
    return { 
      label: 'Learning', 
      color: 'text-amber-600 dark:text-amber-400'
    };
  } else {
    return { 
      label: 'Needs review', 
      color: 'text-rose-600 dark:text-rose-400'
    };
  }
}
