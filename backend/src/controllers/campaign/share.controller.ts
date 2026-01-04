import { Request, Response } from "express";
import {prisma} from "../../lib/prisma";

export const incrementShareCount = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });

    res.status(200).json({
      message: "Share count incremented successfully",
      shares: campaign.shareCount,
    });
  } catch (error) {
    console.error("Error incrementing share count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
