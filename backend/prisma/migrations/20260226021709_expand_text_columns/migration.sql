-- AlterTable
ALTER TABLE `Campaign` MODIFY `coverImage` TEXT NOT NULL,
    MODIFY `proofLinks` TEXT NULL;

-- AlterTable
ALTER TABLE `CampaignUpdate` MODIFY `images` TEXT NOT NULL;
