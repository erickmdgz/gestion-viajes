import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seeds the initial exec-board operator(s). There is no public sign-up
// (participants never log in — NF-2), so operators are created here from
// environment variables. Idempotent: re-running updates the same record.
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_OPERATOR_EMAIL;
  const password = process.env.SEED_OPERATOR_PASSWORD;
  const name = process.env.SEED_OPERATOR_NAME ?? "Exec board";

  if (!email || !password) {
    throw new Error(
      "SEED_OPERATOR_EMAIL and SEED_OPERATOR_PASSWORD must be set (see .env.example).",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const operator = await prisma.operator.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  console.log(`Seeded operator: ${operator.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
