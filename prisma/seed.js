// prisma/seed.js
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: "femboy1@test.com", username: "luna", role: "FEMBOY" },
      { email: "femboy2@test.com", username: "mika", role: "FEMBOY" },
      { email: "renter1@test.com", username: "alex", role: "RENTER" },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
