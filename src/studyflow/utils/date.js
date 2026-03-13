/**
 * Date utilities for StudyFlow
 */

/** Returns today's date as ISO string (YYYY-MM-DD) */
export const today = () => new Date().toISOString().slice(0, 10);

/** Returns true if the given ISO date string is today or in the past */
export const isDue = (dateStr) => !!dateStr && dateStr <= today();

/**
 * Formats a date string into a human-readable relative label.
 * e.g. "dnes", "včera", "před 3 dny", "12. 3. 2025"
 */
export const formatRelative = (dateStr) => {
    if (!dateStr) return 'Nikdy';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86_400_000);
    if (diffDays === 0) return 'dnes';
    if (diffDays === 1) return 'včera';
    if (diffDays < 7) return `před ${diffDays} dny`;
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

/**
 * Calculates next review date using simplified SM-2 algorithm.
 * @param {number} currentSuccessRate - 0..100
 * @param {boolean} correct
 * @returns {{ successRate: number, nextReview: string }}
 */
export const calcNextReview = (currentSuccessRate, correct) => {
    const successRate = Math.min(100, Math.max(0, currentSuccessRate + (correct ? 12 : -15)));
    const daysUntilNext = correct ? Math.max(1, Math.round((currentSuccessRate || 50) / 15)) : 1;
    const next = new Date();
    next.setDate(next.getDate() + daysUntilNext);
    return {
        successRate,
        nextReview: next.toISOString().slice(0, 10),
    };
};
