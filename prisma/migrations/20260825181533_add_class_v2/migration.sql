-- CreateTable
CREATE TABLE `class_v2`
(
    `id`               INTEGER     NOT NULL AUTO_INCREMENT,
    `teacherId`        INTEGER     NOT NULL,
    `studentId`        INTEGER     NOT NULL,
    `date`             VARCHAR(10) NOT NULL,
    `startTime`        VARCHAR(5)  NOT NULL,
    `endTime`          VARCHAR(5)  NOT NULL,
    `meetLink`         VARCHAR(191) NULL,
    `status`           ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `teacherAttended`  BOOLEAN     NOT NULL DEFAULT false,
    `studentAttended`  BOOLEAN     NOT NULL DEFAULT false,
    `teacherJoinedAt`  DATETIME(3) NULL,
    `studentJoinedAt`  DATETIME(3) NULL,
    `attendanceStatus` ENUM('PENDING', 'TEACHER_PRESENT', 'STUDENT_PRESENT', 'ALL_PRESENT', 'ABSENT') NOT NULL DEFAULT 'PENDING',
    `createdAt`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`        DATETIME(3) NOT NULL,

    INDEX              `class_v2_date_status_idx`(`date`, `status`),
    INDEX              `class_v2_date_teacherId_idx`(`date`, `teacherId`),
    INDEX              `class_v2_date_studentId_idx`(`date`, `studentId`),
    INDEX              `class_v2_status_endTime_idx`(`status`, `endTime`),
    INDEX              `class_v2_teacherId_endTime_idx`(`teacherId`, `endTime`),
    INDEX              `class_v2_studentId_endTime_idx`(`studentId`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `class_v2`
    ADD CONSTRAINT `class_v2_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_v2`
    ADD CONSTRAINT `class_v2_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
