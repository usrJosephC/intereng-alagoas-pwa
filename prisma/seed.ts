import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const ATLETICAS = ["Atlética Poseidon", "Atlética Fúria", "Atlética Titã"];

async function main() {
  for (const name of ATLETICAS) {
    await prisma.atletica.upsert({ where: { name }, update: {}, create: { name } });
    console.log(`Atlética garantida: ${name}`);
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Diretoria InterEng Alagoas";

  if (!email || !password) {
    console.warn(
      "SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD não definidos - pulando criação do admin."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, passwordHash, name, role: "ADMIN" },
  });
  console.log(`Admin da diretoria garantido: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
