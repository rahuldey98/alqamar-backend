import {DayOfWeek} from "@prisma/client";

export const getCurrentDayOfWeek = (): DayOfWeek => {
    const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
    }).format(new Date()).toUpperCase();

    return DayOfWeek[dayName as keyof typeof DayOfWeek];
};
