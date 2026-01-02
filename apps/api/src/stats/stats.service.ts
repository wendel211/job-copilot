import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  EmailSendStatus,
  SavedJobStatus,
  AtsType,
} from "@prisma/client";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    // 1. Total Geral
    const totalSaved = await this.prisma.savedJob.count({
      where: { userId },
    });

    // 2. Rascunhos
    const drafts = await this.prisma.emailDraft.count({
      where: { userId },
    });

    // 3. Agrupamento por Status (Para preencher os cards coloridos)
    const byStatus = await this.prisma.savedJob.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    });

    // Função auxiliar para somar status (ex: applied + sent = candidaturas)
    const getCount = (targetStatuses: string[]) => {
      return byStatus
        .filter((item) => targetStatuses.includes(item.status))
        .reduce((acc, curr) => acc + curr._count.status, 0);
    };

    // 4. Últimas Atividades (Feed)
    const recentActivity = await this.prisma.savedJob.findMany({
      where: { userId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        job: {
          select: {
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    });

    return {
      overview: {
        total: totalSaved,
        // Consideramos 'applied' (manual) e 'sent' (email enviado) como candidaturas feitas
        applied: getCount(["applied", "sent"]), 
        // Consideramos screening e interview como processos de entrevista
        interviews: getCount(["interview", "screening"]),
        offers: getCount(["offer"]),
        rejected: getCount(["rejected"]),
        drafts: drafts,
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        status: activity.status,
        updatedAt: activity.updatedAt,
        job: {
            title: activity.job.title,
            company: { name: activity.job.company.name }
        }
      })),
    };
  }

  // ===========================================================
  // 📊 MÉTODOS ANALÍTICOS (MANTIDOS DO SEU CÓDIGO)
  // ===========================================================

  // 1. Emails enviados por dia
  async emailsPerDay(userId: string) {
    return this.prisma.emailSend.groupBy({
      by: ["submittedAt"],
      where: {
        userId,
        status: EmailSendStatus.sent,
      },
      _count: true,
      orderBy: {
        submittedAt: "asc",
      },
    });
  }

  // 2. Fail Rate de e-mails
  async emailFailRate(userId: string) {
    const sent = await this.prisma.emailSend.count({
      where: { userId, status: EmailSendStatus.sent },
    });

    const failed = await this.prisma.emailSend.count({
      where: { userId, status: EmailSendStatus.failed },
    });

    const total = sent + failed;

    return {
      sent,
      failed,
      total,
      failRate: total === 0 ? 0 : failed / total,
    };
  }

  // 3. Distribuição de ATS
  async atsDistribution(userId: string) {
    return this.prisma.job.groupBy({
      by: ["atsType"],
      where: {
        savedJobs: {
          some: { userId },
        },
      },
      _count: true,
    });
  }

  // 4. Funil do Pipeline
  async pipelineFunnel(userId: string) {
    const grouped = await this.prisma.savedJob.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    });

    const allStatuses = Object.values(SavedJobStatus);

    return allStatuses.map((s) => ({
      status: s,
      count: grouped.find((g) => g.status === s)?._count ?? 0,
    }));
  }

  // 5. Tempo médio para envio
  async timeToSendEmail(userId: string) {
    const sends = await this.prisma.emailSend.findMany({
      where: {
        userId,
        sentAt: { not: null },
      },
      include: {
        draft: true,
      },
    });

    const times: number[] = [];

    for (const send of sends) {
      if (!send.draft?.jobId) continue;

      const saved = await this.prisma.savedJob.findFirst({
        where: { userId, jobId: send.draft.jobId },
      });

      if (!saved || !send.sentAt) continue;

      const diffMs = send.sentAt.getTime() - saved.createdAt.getTime();
      times.push(diffMs);
    }

    if (times.length === 0) {
      return { avgMs: 0, avgHours: 0, avgDays: 0 };
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;

    return {
      avgMs: avg,
      avgHours: avg / 1000 / 60 / 60,
      avgDays: avg / 1000 / 60 / 60 / 24,
    };
  }

  // 6. Eventos por dia
  async eventsPerDay(userId: string) {
    const rows = await this.prisma.event.groupBy({
      by: ["createdAt"],
      where: { userId },
      _count: true,
      orderBy: {
        createdAt: "asc",
      },
    });

    return rows.map((row) => ({
      date: row.createdAt,
      count: row._count,
    }));
  }

  // 7. Eventos por tipo
  async eventsByType(userId: string) {
    return this.prisma.event.groupBy({
      by: ["type"],
      where: { userId },
      _count: { type: true },
      orderBy: {
        _count: {
          type: "desc",
        },
      },
    });
  }

  // 8. Status mais comum
  async mostCommonStatus(userId: string) {
    const funnel = await this.pipelineFunnel(userId);
    const max = funnel.reduce((a, b) => (b.count > a.count ? b : a), {
      status: "none",
      count: 0,
    });
    return max;
  }

  // 9. ATS mais frequente
  async mostCommonATS(userId: string) {
    const dist = await this.atsDistribution(userId);
    if (!dist.length) return null;
    return dist.reduce((a, b) => (b._count > a._count ? b : a));
  }
}