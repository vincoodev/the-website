import { prisma } from "@lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, username, role } = req.body;

    if (!email || !username || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        role,
      },
    });

    return res.status(201).json(user);
  }

  if (req.method === "GET") {
    const users = await prisma.user.findMany();
    console.log("Seeding database...");

    // clean existing data (safe for dev only)
    await prisma.user.deleteMany();

    // seed users
    await prisma.user.createMany({
      data: [
        {
          email: "femboy1@test.com",
          username: "luna",
          role: "FEMBOY",
        },
        {
          email: "femboy2@test.com",
          username: "mika",
          role: "FEMBOY",
        },
        {
          email: "renter1@test.com",
          username: "alex",
          role: "RENTER",
        },
      ],
    });

    console.log("Seed completed.");
    return res.status(200).json(users);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
