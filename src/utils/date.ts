import {DayOfWeek} from "@prisma/client";

export const IST_TIMEZONE = "Asia/Kolkata";

export const getCurrentDayOfWeek = (): DayOfWeek => {
    const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: IST_TIMEZONE,
    }).format(new Date()).toUpperCase();

    return DayOfWeek[dayName as keyof typeof DayOfWeek];
};

export const getDayOfWeekFromDate = (date: string): DayOfWeek => {
    // Parse as a UTC date so a date-only string ("2026-06-23") isn't shifted by timezone.
    const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`)).toUpperCase();

    return DayOfWeek[dayName as keyof typeof DayOfWeek];
};

/**
 * Returns the current date in IST formatted as "YYYY-MM-DD"
 */
export const getTodayDateIST = (): string => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
};

/**
 * Returns the current time in IST formatted as "HH:MM" (24-hour format)
 */
export const getCurrentISTTime = (): string => {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: IST_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date());
};

/**
 * Validates if a string is in 24-hour "HH:MM" format (00:00 to 23:59)
 */
export const isValidTimeFormat = (time: string): boolean => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

