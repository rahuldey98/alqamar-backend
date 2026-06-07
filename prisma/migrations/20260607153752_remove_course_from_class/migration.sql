/*
  Warnings:

  - You are about to drop the column `courseId` on the `Class` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Class` DROP FOREIGN KEY `Class_courseId_fkey`;

-- DropIndex
DROP INDEX `Class_courseId_fkey` ON `Class`;

-- AlterTable
ALTER TABLE `Class` DROP COLUMN `courseId`;
