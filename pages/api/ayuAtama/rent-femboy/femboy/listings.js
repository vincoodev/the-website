import { prisma } from "@lib/prisma";
import { requireAuth } from "@/middleware/auth";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ----------------------------------
  // Role check
  // ----------------------------------
  if (req.user.role !== "FEMBOY") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { isActive = true, availability = [] } = req.body;

  try {
    // ----------------------------------
    // Get femboy profile
    // ----------------------------------
    const profile = await prisma.femboyProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Femboy profile not found" });
    }
    // ----------------------------------
    // Create or update listing (UPSERT)
    // ----------------------------------
    const listing = await prisma.listing.upsert({
      where: {
        femboyId: profile.id,
      },
      update: {
        isActive,
        availability: {
          deleteMany: {},
          create: availability.map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      create: {
        femboyId: profile.id,
        isActive,
        availability: {
          create: availability.map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
    });

    return res.status(201).json({
      message: "Listing published",
      listingId: listing.id,
      data: listing,
    });
  } catch (error) {
    console.error("CREATE_LISTING_ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default requireAuth(handler);
