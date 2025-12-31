import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Configurar o Adapter do PostgreSQL
// O Prisma Client foi gerado esperando um adapter, então precisamos criá-lo aqui.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // 2. Criar Usuário Demo
  const user = await prisma.user.upsert({
    where: { email: 'demo@jobcopilot.local' },
    update: {},
    create: {
      email: 'demo@jobcopilot.local',
      fullName: 'Usuário Demo',
      phone: '+55 11 99999-9999',
    },
  });
  console.log(`👤 Usuário criado: ${user.email}`);

  // 3. Criar Empresas para o Crawler
  const companies = [
    {
      name: 'Nubank',
      website: 'nubank.com.br',
      atsProvider: 'greenhouse',
      careerPageUrl: 'nubank',
    },
    {
      name: 'Netflix',
      website: 'netflix.com',
      atsProvider: 'lever',
      careerPageUrl: 'netflix',
    },
    {
      name: 'Globo',
      website: 'globo.com',
      atsProvider: 'gupy',
      careerPageUrl: 'globo',
    },
    {
      name: 'Mercado Livre',
      website: 'mercadolivre.com.br',
      atsProvider: 'workday',
      careerPageUrl: 'mercadolibre',
    }
  ];

  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { name: companyData.name },
      update: {
        atsProvider: companyData.atsProvider as any,
        careerPageUrl: companyData.careerPageUrl,
      },
      create: {
        name: companyData.name,
        website: companyData.website,
        atsProvider: companyData.atsProvider as any,
        careerPageUrl: companyData.careerPageUrl,
      },
    });
    console.log(`🏢 Empresa configurada: ${company.name} [${companyData.atsProvider}]`);
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });