/*
  Warnings:

  - You are about to drop the column `viewCount` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Campaign` DROP COLUMN `viewCount`,
    ADD COLUMN `visits` INTEGER NOT NULL DEFAULT 0;
