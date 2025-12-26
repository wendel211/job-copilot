import "dotenv/config";
import { PrismaClient, AtsType, JobSourceType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set. Check apps/api/.env");

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@jobcopilot.local" },
    update: {},
    create: {
      email: "demo@jobcopilot.local",
      fullName: "Demo User",
      phone: "+55 75 00000-0000",
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
    },
  });

  let company = await prisma.company.findFirst({
    where: { name: "ACME Tech" },
  });

  if (!company) {
    company = await prisma.company.create({
      data: { name: "ACME Tech", website: "https://acme.example" },
    });
  }

  const exists = await prisma.job.findFirst({
    where: { sourceType: JobSourceType.manual, sourceKey: "demo-job-1" },
  });

  if (!exists) {
    await prisma.job.create({
      data: {
        sourceType: JobSourceType.manual,
        sourceKey: "demo-job-1",
        atsType: AtsType.unknown,
        title: "Desenvolvedor(a) Full Stack",
        location: "Remoto - Brasil",
        remote: true,
        description:
          "Vaga para Full Stack com Node.js, NestJS, React/Next.js e PostgreSQL. Diferenciais: Redis, filas e integração com APIs.",
        applyUrl: "https://acme.example/careers/fullstack",
        companyId: company.id,
      },
    });
  }

  console.log("Seed OK:", { user: user.email, company: company.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
