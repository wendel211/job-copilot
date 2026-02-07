import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobsService } from '../../jobs/jobs.service';
import { ResumeParserService } from '../../users/resume-parser.service';

@Injectable()
export class AiService {
    constructor(
        private prisma: PrismaService,
        private jobsService: JobsService,
        private resumeParser: ResumeParserService,
    ) { }

    async analyzeMatch(userId: string, jobId: string) {
        // 1. Buscar User e suas Skills
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { skills: true },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado');

        // 2. Buscar Job
        const job = await this.jobsService.findOne(jobId);
        if (!job) throw new NotFoundException('Vaga não encontrada');

        // 3. Extrair Skills da Vaga (usando o parser)
        // Se a vaga já tivesse skills salvas no banco, usaríamos. Como não tem, extraímos da descrição.
        const jobSkills = this.resumeParser.extractSkills(job.description);

        // 4. Comparar
        const userSkillsSet = new Set(user.skills.map((s) => s.toLowerCase()));

        // Encontrar skills em comum
        const matchingSkills = jobSkills.filter((skill) =>
            userSkillsSet.has(skill.toLowerCase()),
        );

        // Encontrar skills faltando
        const missingSkills = jobSkills.filter(
            (skill) => !userSkillsSet.has(skill.toLowerCase()),
        );

        // 5. Calcular Score (Simples: % de skills da vaga que o usuário tem)
        // Se a vaga não tiver skills detectáveis, damos um score neutro ou baseado em keywords gerais?
        // Vamos assumir 0 se a vaga não pede nada técnico detectável, ou 100? 
        // Melhor: Se jobSkills for vazio, retornar 50 (neutro) ou erro.

        let score = 0;
        if (jobSkills.length > 0) {
            score = Math.round((matchingSkills.length / jobSkills.length) * 100);
        } else {
            // Fallback: se não detectou skills, talvez seja vaga não técnica.
            score = 50;
        }

        return {
            score,
            analysis: `Você tem ${matchingSkills.length} de ${jobSkills.length} habilidades requeridas.`,
            matchingSkills,
            missingSkills,
            jobSkills, // Debug info
        };
    }
}
