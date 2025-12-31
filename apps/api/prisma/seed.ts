import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Criar Usuário Demo
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

  // 2. Criar Empresas para o Crawler (Exemplos Reais)
  const companies = [
    {
      name: 'Nubank',
      website: 'nubank.com.br',
      atsProvider: 'greenhouse',
      careerPageUrl: 'nubank', // Slug do Greenhouse
    },
    {
      name: 'Netflix',
      website: 'netflix.com',
      atsProvider: 'lever',
      careerPageUrl: 'netflix', // Slug do Lever
    },
    {
      name: 'Globo',
      website: 'globo.com',
      atsProvider: 'gupy',
      careerPageUrl: 'globo', // Slug da Gupy
    },
    {
      name: 'Mercado Livre',
      website: 'mercadolivre.com.br',
      atsProvider: 'workday', // Exemplo de ATS ainda sem crawler ativo (ficará apenas salvo)
      careerPageUrl: 'mercadolibre',
    }
  ];

  for (const companyData of companies) {
    // Usamos 'as any' aqui caso o TS do seu editor ainda esteja cacheado, 
    // mas o prisma client gerado vai aceitar.
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