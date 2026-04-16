-- CreateTable
CREATE TABLE `Class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `teacherId` INTEGER NOT NULL,
    `meetLink` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
