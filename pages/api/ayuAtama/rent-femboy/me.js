import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/middleware/auth";

async function handler(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "RENTER") {
      const renter = await prisma.renterProfile.findUnique({
        where: { userId },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      });

      const email = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      return res.status(200).json({
        userId,
        role,
        profile: renter
          ? {
              nickname: renter.nickname,
              image: renter.images[0]?.url || null,
            }
          : null,
        email: email?.email || null,
      });
    }

    if (role === "FEMBOY") {
      const femboy = await prisma.femboyProfile.findUnique({
        where: { userId },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
          listing: {
            select: { isActive: true },
          },
        },
      });

      const email = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      return res.status(200).json({
        userId,
        role,
        profile: femboy
          ? {
              displayName: femboy.displayName,
              baseRate: femboy.baseRate,
              isActive: femboy.listing?.isActive ?? false,
              image: femboy.images[0]?.url || null,
              bio: femboy.bio || null,
            }
          : null,
        email: email?.email || null,
      });
    }

    return res.status(400).json({ error: "Unknown role" });
  } catch (error) {
    console.error("ME_ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default requireAuth(handler);
