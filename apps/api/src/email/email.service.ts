import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateDraftDto } from "./draft/dto/update-draft.dto";

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  async generateDraft(userId: string, jobId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { template: true },
    });
    if (!user) throw new NotFoundException("User not found");

    if (!user.fullName) {
      throw new BadRequestException(
        "Preencha o fullName do usuário antes de gerar draft.",
      );
    }

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
  async listDrafts(userId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    const drafts = await this.prisma.emailDraft.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        jobId: true,
        subject: true,
        toEmail: true,
        createdAt: true,
        updatedAt: true,
        editorOpenedAt: true,
        checklist: true,
        attachments: true,
        job: {
          select: {
            id: true,
            title: true,
            atsType: true,
            applyUrl: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
    });

    return { drafts };
  }

  async getDraftById(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      include: {
        job: {
          include: {
            company: true,
            requirements: true,
          },
        },
        sends: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            error: true,
            toEmail: true,
            toDomain: true,
            submittedAt: true,
            sentAt: true,
            providerId: true,
          },
        },
      },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    return { draft };
  }

  async markOpened(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      select: { id: true, editorOpenedAt: true },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: { editorOpenedAt: draft.editorOpenedAt ?? new Date() },
      select: { id: true, editorOpenedAt: true, updatedAt: true },
    });

    return { draft: updated };
  }


  async updateDraft(userId: string, draftId: string, dto: UpdateDraftDto) {
    if (!userId) throw new BadRequestException("userId is required");

    const exists = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException("Draft not found");

    const { subject, bodyText, toEmail, attachments, checklist } = dto;

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        subject: subject ?? undefined,
        bodyText: bodyText ?? undefined,
        toEmail: toEmail ?? undefined,
        attachments: attachments ?? undefined,
        checklist: checklist ?? undefined,
      },
      select: {
        id: true,
        subject: true,
        bodyText: true,
        toEmail: true,
        attachments: true,
        checklist: true,
        editorOpenedAt: true,
        updatedAt: true,
      },
    });

    return { draft: updated };
  }

  async toggleChecklist(userId: string, draftId: string, item: string) {
    if (!userId) throw new BadRequestException("userId is required");
    if (!item?.trim()) throw new BadRequestException("item is required");

    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      select: { id: true, checklist: true },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    const normalized = item.trim();
    const normalizedKey = normalized.toLowerCase();

    const current = (draft.checklist ?? []).filter(Boolean);
    const currentKeys = current.map((x) => x.toLowerCase());

    const has = currentKeys.includes(normalizedKey);

    let next: string[];
    if (has) {
      next = current.filter((x) => x.toLowerCase() !== normalizedKey);
    } else {
      next = [...current, normalized];
    }

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: { checklist: next },
      select: { id: true, checklist: true, updatedAt: true },
    });

    return { draft: updated };
  }

  private buildBody(args: {
    companyName: string;
    jobTitle: string;
    user: any;
    template: {
      baseIntro?: string | null;
      baseBullets?: string | null;
      closingLine?: string | null;
    } | null;
    requirements: { skills: string[]; keywords: string[] } | null;
    jobDescription: string;
  }) {
    const { companyName, jobTitle, user, template, requirements, jobDescription } =
      args;

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

    const closing =
      template?.closingLine?.trim() ||
      "Obrigado pela atenção. Fico à disposição para conversar.";

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

    const fromReq = [...args.skills, ...args.keywords]
      .map((x) => x.trim())
      .filter(Boolean);

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
