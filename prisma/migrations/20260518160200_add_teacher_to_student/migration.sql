-- AlterTable
ALTER TABLE `Student` ADD COLUMN `teacherId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
