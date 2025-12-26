import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  async generateDraft(userId: string, jobId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { template: true },
    });
    if (!user) throw new NotFoundException("User not found");
    if (!user.fullName) throw new BadRequestException("Preencha o fullName do usuário antes de gerar draft.");

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true, requirements: true },
    });
    if (!job) throw new NotFoundException("Job not found");

    const subject = `Candidatura – ${job.title} | ${user.fullName}`;
    const bodyText = this.buildBody({
      companyName: job.company.name,
      jobTitle: job.title,
      user,
      template: user.template ?? null,
      requirements: job.requirements ?? null,
      jobDescription: job.description,
    });

    const draft = await this.prisma.emailDraft.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: {
        userId,
        jobId,
        subject,
        bodyText,
        checklist: [
          "Revisar texto antes de enviar",
          "Anexar currículo ATS-safe (PDF ou DOCX)",
          "Confirmar destinatário",
        ],
      },
      update: {
        subject,
        bodyText,
      },
    });

    return {
      draftId: draft.id,
      subject: draft.subject,
      body: draft.bodyText,
      atsType: job.atsType,
    };
  }

  private buildBody(args: {
    companyName: string;
    jobTitle: string;
    user: any;
    template: { baseIntro?: string | null; baseBullets?: string | null; closingLine?: string | null } | null;
    requirements: { skills: string[]; keywords: string[] } | null;
    jobDescription: string;
  }) {
    const { companyName, jobTitle, user, template, requirements, jobDescription } = args;

    const greeting = `Olá, equipe de recrutamento da ${companyName},`;

    const intro =
      template?.baseIntro?.trim() ||
      `Meu nome é ${user.fullName} e tenho interesse na oportunidade de ${jobTitle}.`;

    const bullets = this.makeBullets({
      templateBullets: template?.baseBullets ?? null,
      skills: requirements?.skills ?? [],
      keywords: requirements?.keywords ?? [],
      description: jobDescription,
    });

    const links: string[] = [];
    if (user.linkedinUrl) links.push(`LinkedIn: ${user.linkedinUrl}`);
    if (user.githubUrl) links.push(`GitHub: ${user.githubUrl}`);

    const closing = template?.closingLine?.trim() || "Obrigado pela atenção. Fico à disposição para conversar.";

    return [
      greeting,
      "",
      intro,
      "",
      "Destaques de alinhamento com a vaga:",
      ...bullets.map((b) => `- ${b}`),
      "",
      ...(links.length ? ["Links:", ...links.map((l) => `- ${l}`), ""] : []),
      closing,
      "",
      user.fullName,
      user.phone ? `Telefone: ${user.phone}` : null,
      `E-mail: ${user.email}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  private makeBullets(args: {
    templateBullets: string | null;
    skills: string[];
    keywords: string[];
    description: string;
  }) {
    const fromTemplate = (args.templateBullets ?? "")
      .split("\n")
      .map((s) => s.replace(/^[-*]\s?/, "").trim())
      .filter(Boolean);

    const fromReq = [...args.skills, ...args.keywords].map((x) => x.trim()).filter(Boolean);

    const fallback = this.fallbackBullets(args.description);

    const combined = [
      ...fromTemplate,
      ...fromReq.map((k) => `Experiência relacionada a ${k}`),
      ...fallback,
      "Boas práticas: código limpo, colaboração e documentação",
    ];

    return Array.from(new Set(combined)).slice(0, 5);
  }

  private fallbackBullets(desc: string) {
    const d = (desc || "").toLowerCase();
    const hits: string[] = [];

    if (d.includes("nestjs")) hits.push("Vivência com NestJS e arquitetura modular");
    if (d.includes("node")) hits.push("Experiência com Node.js em APIs e integrações");
    if (d.includes("postgres")) hits.push("Uso de PostgreSQL e modelagem de dados");
    if (d.includes("prisma")) hits.push("Experiência com Prisma ORM e migrations");
    if (d.includes("docker")) hits.push("Conhecimento em Docker e ambientes reprodutíveis");

    return hits;
  }
}
