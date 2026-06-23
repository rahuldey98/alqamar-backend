import {DayOfWeek} from "@prisma/client";

export const getCurrentDayOfWeek = (): DayOfWeek => {
    const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
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
