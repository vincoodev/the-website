import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/middleware/auth";

async function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    email,
    password,
    nickname,
    displayName,
    bio,
    baseRate,
    imageUrl,
  } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // ----------------------------------
      // Update User (email / password)
      // ----------------------------------
      const userUpdate = {};

      if (email) userUpdate.email = email;
      if (password) {
        userUpdate.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: req.user.id },
          data: userUpdate,
        });
      }

      // ----------------------------------
      // RENTER PROFILE UPDATE
      // ----------------------------------
      if (req.user.role === "RENTER") {
        const renterProfile = await tx.renterProfile.findUnique({
          where: { userId: req.user.id },
        });

        if (!renterProfile) {
          throw new Error("Renter profile not found");
        }

        if (nickname) {
          await tx.renterProfile.update({
            where: { id: renterProfile.id },
            data: { nickname },
          });
        }

        if (imageUrl) {
          // Remove old images
          await tx.renterProfileImage.deleteMany({
            where: { profileId: renterProfile.id },
          });

          // Insert new image
          await tx.renterProfileImage.create({
            data: {
              profileId: renterProfile.id,
              url: imageUrl,
              isPrimary: true,
            },
          });
        }
      }

      // ----------------------------------
      // FEMBOY PROFILE UPDATE
      // ----------------------------------
      if (req.user.role === "FEMBOY") {
        const femboyProfile = await tx.femboyProfile.findUnique({
          where: { userId: req.user.id },
        });

        if (!femboyProfile) {
          throw new Error("Femboy profile not found");
        }

        await tx.femboyProfile.update({
          where: { id: femboyProfile.id },
          data: {
            displayName,
            bio,
            baseRate:
              typeof baseRate === "number" ? baseRate : undefined,
          },
        });

        if (imageUrl) {
          // Remove old images
          await tx.femboyProfileImage.deleteMany({
            where: { profileId: femboyProfile.id },
          });

          // Insert new image
          await tx.femboyProfileImage.create({
            data: {
              profileId: femboyProfile.id,
              url: imageUrl,
              isPrimary: true,
            },
          });
        }
      }
    });

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default requireAuth(handler);
