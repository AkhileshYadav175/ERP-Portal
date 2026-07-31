/**
 * Date Helper - Standardizes financial calendar calculations and upcoming installment checks.
 */

/**
 * Increment a date by a set number of months, keeping the day of month matching
 * as closely as possible (capping to the last day of target month if needed).
 * Effectively handles leap years and variable month lengths.
 * @param {Date|string} baseDate - Starting base Date.
 * @param {number} monthsToAdd - Number of months to increment.
 * @returns {Date} Incremented Date object.
 */
const addMonths = (baseDate, monthsToAdd) => {
  const date = new Date(baseDate);
  const targetDay = date.getDate();

  // Set day to 1st to prevent overflow issues when adding months
  date.setDate(1);
  date.setMonth(date.getMonth() + monthsToAdd);

  // Get total days in target month
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  // Cap day to target month maximum
  date.setDate(Math.min(targetDay, daysInMonth));
  return date;
};

/**
 * Helper to determine a custom upcoming due status string based on today's calendar date.
 * Dashboard and alerts future ready helper.
 * @param {Date|string} dueDate - Expected due date.
 * @param {string} status - Installment payment status (PENDING, PARTIAL, PAID, etc.)
 * @returns {string} Calculated indicator status: 'PAID', 'OVERDUE', 'Due Today', 'Upcoming', or base status.
 */
const getDueIndicator = (dueDate, status) => {
  if (status === 'PAID') return 'PAID';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  // Calculate day difference
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'OVERDUE';
  } else if (diffDays === 0) {
    return 'Due Today';
  } else if (diffDays >= 1 && diffDays <= 7) {
    return 'Upcoming';
  }

  return status;
};

module.exports = {
  addMonths,
  getDueIndicator
};
