import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;

export const incrementVisitCount = async (req: Request, res: Response) => {
  const { id } = req.params;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const campaign = await prisma.campaign.update({
        where: { id },
        data: {
          visits: {
            increment: 1,
          },
        },
      });

      return res.status(200).json({
        message: "Visit count incremented successfully",
        visits: campaign.visits,
      });
    } catch (error: any) {
      if (error.code === 'P2025' || (error.cause && error.cause.originalCode === '1020')) { // P2025 for not found, 1020 for concurrency in MariaDB
        console.warn(`Concurrency error on visit count for campaign ${id}. Retrying... (${i + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
      } else {
        console.error("Error incrementing visit count:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  // If all retries fail
  console.error(`Failed to increment visit count for campaign ${id} after ${MAX_RETRIES} retries.`);
  res.status(500).json({ message: "Failed to increment visit count due to persistent concurrency issues." });
};
