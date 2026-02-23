-- AlterTable
ALTER TABLE `Campaign` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'general';

-- AlterTable
ALTER TABLE `Milestone` ADD COLUMN `claimProof` VARCHAR(191) NULL,
    ADD COLUMN `claimStatus` VARCHAR(191) NOT NULL DEFAULT 'UNCLAIMED',
    ADD COLUMN `fundsReleased` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `releasedAmount` DECIMAL(12, 2) NULL,
    ADD COLUMN `releasedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedBy` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `RecurringDonation` (
    `id` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `nextDueDate` DATETIME(3) NOT NULL,
    `lastPaidDate` DATETIME(3) NULL,
    `totalPaid` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `paymentCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RecurringDonation_donorId_idx`(`donorId`),
    INDEX `RecurringDonation_campaignId_idx`(`campaignId`),
    INDEX `RecurringDonation_status_nextDueDate_idx`(`status`, `nextDueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Campaign_category_idx` ON `Campaign`(`category`);

-- AddForeignKey
ALTER TABLE `RecurringDonation` ADD CONSTRAINT `RecurringDonation_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecurringDonation` ADD CONSTRAINT `RecurringDonation_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
