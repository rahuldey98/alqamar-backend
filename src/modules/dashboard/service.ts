import {prisma} from "../../db/prisma";
import {Status, UserRole} from "@prisma/client";
import {getCurrentDayOfWeek} from "../../utils/date";

const getOverview = async () => {
    const todayDayOfWeek = getCurrentDayOfWeek();

    const [totalStudents, totalTeachers, todayTotalClasses] = await Promise.all([
        prisma.user.count({where: {role: UserRole.STUDENT, status: Status.ACTIVE}}),
        prisma.user.count({where: {role: UserRole.TEACHER, status: Status.ACTIVE}}),
        prisma.class.count({
            where: {
                status: Status.ACTIVE,
                schedules: {some: {dayOfWeek: todayDayOfWeek, status: Status.ACTIVE}},
            },
        }),
    ]);

    return {totalStudents, totalTeachers, todayTotalClasses};
};

export const DashboardService = {
    getOverview,
};
