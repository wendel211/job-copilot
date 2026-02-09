import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { ResumeParserService } from '../users/resume-parser.service';

@Injectable()
export class AiService {
    constructor(
        private prisma: PrismaService,
        private jobsService: JobsService,
        private resumeParser: ResumeParserService,
    ) { }

    async analyzeMatch(userId: string, jobId: string) {
        console.log(`[AiService] Iniciando análise para User ${userId} e Job ${jobId}`);
        try {
            // 1. Buscar User e suas Skills
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            console.log(`[AiService] User encontrado: ${user?.email}`);

            if (!user) throw new NotFoundException('Usuário não encontrado');

            // 2. Buscar Job
            const job = await this.jobsService.findOne(jobId);
            console.log(`[AiService] Job encontrado: ${job?.title}, ID: ${job?.id}`);

            if (!job) throw new NotFoundException('Vaga não encontrada');

            // 3. Extrair Skills da Vaga (usando o parser)
            const jobDescription = job.description || '';
            console.log(`[AiService] Descrição tamanho: ${jobDescription.length}`);

            let jobSkills: string[] = [];
            try {
                jobSkills = this.resumeParser.extractSkills(jobDescription);
                console.log(`[AiService] Skills extraídas da vaga: ${jobSkills.length}`);
            } catch (parserError) {
                console.error('[AiService] Erro ao extrair skills da vaga:', parserError);
                // Fallback para evitar falha total
                jobSkills = [];
            }

            // 4. Comparar (Safety check for user skills)
            const userSkillsList = user.skills || [];
            const userSkillsSet = new Set(
                userSkillsList
                    .filter(s => typeof s === 'string')
                    .map((s) => s.toLowerCase())
            );

            // Encontrar skills em comum
            const matchingSkills = jobSkills.filter((skill) =>
                userSkillsSet.has(skill.toLowerCase()),
            );

            // Encontrar skills faltando
            const missingSkills = jobSkills.filter(
                (skill) => !userSkillsSet.has(skill.toLowerCase()),
            );

            // 5. Calcular Scores (Simulação ATS)
            // Hard Skills: % de skills encontradas
            let hardSkillsScore = 0;
            if (jobSkills.length > 0) {
                hardSkillsScore = (matchingSkills.length / jobSkills.length) * 100;
            } else {
                hardSkillsScore = 50; // Fallback se não houver skills na vaga
            }

            // Keywords: (Similar a Hard Skills por enquanto, mas poderia incluir outras palavras)
            // Vamos usar randomização leve para diferenciar visualmente na demo se faltar dados reais
            const keywordsScore = Math.min(100, hardSkillsScore + 10);

            // Experiência: Heurística baseada no tamanho da bio/descrição (Simulado)
            // Se a bio do user for longa, assume boa experiência
            const experienceScore = Math.min(100, (user.bio?.length || 0) / 5);

            // Score Geral Padronizado
            const totalScore = Math.round((hardSkillsScore * 0.5) + (keywordsScore * 0.3) + (experienceScore * 0.2));

            // 6. Classificação & Chance
            let classification = 'Baixo';
            let feedback = '';
            let chanceOfPassing = 'Baixa';

            if (totalScore >= 80) {
                classification = 'Alta Aderência';
                chanceOfPassing = 'Alta';
                feedback = `Seu perfil está muito bem alinhado com esta vaga. Você possui a maioria das competências técnicas exigidas (${matchingSkills.slice(0, 3).join(', ')}).`;
            } else if (totalScore >= 60) {
                classification = 'Médio Potencial';
                chanceOfPassing = 'Média';
                feedback = `Você tem um bom potencial, mas faltam algumas competências importantes como ${missingSkills.slice(0, 3).join(', ')}. Tente destacar experiências relacionadas em seu resumo.`;
            } else {
                classification = 'Abaixo do corte';
                chanceOfPassing = 'Baixa';
                feedback = `O perfil atual tem pouca aderência com os requisitos da vaga. Faltam muitas palavras-chave essenciais (${missingSkills.slice(0, 3).join(', ')}). Considere adequar seu currículo ou buscar vagas mais alinhadas ao seu momento atual.`;
            }

            // 7. Gaps Críticos (Simulado com mensagens do ATS)
            const gaps = missingSkills.map(skill => `Ausência de conhecimento explícito em ${skill}.`);
            if (userSkillsList.length < 5) gaps.push('Poucas habilidades cadastradas no perfil.');
            if (!user.bio || user.bio.length < 50) gaps.push('Resumo profissional (Bio) muito curto ou ausente.');

            // 8. Pontos de Otimização (Dicas acionáveis)
            const optimizationPoints = [];
            if (missingSkills.length > 0) {
                optimizationPoints.push(`Adicione projetos que utilizem ${missingSkills[0]} ao seu portfólio.`);
                if (missingSkills.length > 1) optimizationPoints.push(`Mencione explicitamente ${missingSkills[1]} na sua Bio se você tiver experiência.`);
            }
            if (user.bio && user.bio.length < 200) optimizationPoints.push('Expanda seu resumo profissional para incluir mais palavras-chave contextuais.');
            if (keywordsScore < 70) optimizationPoints.push('Otimize seu perfil com termos técnicos específicos da vaga.');

            // 9. Pontos Fortes
            const strengths: string[] = [];
            if (matchingSkills.length > 0) {
                strengths.push(`Proficiência nas tecnologias: ${matchingSkills.slice(0, 5).join(', ')}.`);
            }
            if (matchingSkills.length >= 3) {
                strengths.push(`Boa cobertura de hard skills exigidas (${matchingSkills.length}/${jobSkills.length} encontradas).`);
            }
            if (user.bio && user.bio.length >= 100) {
                strengths.push('Resumo profissional completo e descritivo.');
            }
            if (userSkillsList.length >= 10) {
                strengths.push(`Amplo repertório de habilidades cadastradas (${userSkillsList.length} skills).`);
            }
            if (hardSkillsScore >= 60) {
                strengths.push('Alinhamento técnico acima da média com os requisitos da vaga.');
            }
            if (experienceScore >= 50) {
                strengths.push('Experiência profissional bem documentada no perfil.');
            }

            // 10. Nível de Risco
            let riskLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';
            if (totalScore >= 75) {
                riskLevel = 'BAIXO';
            } else if (totalScore >= 50) {
                riskLevel = 'MÉDIO';
            } else {
                riskLevel = 'ALTO';
            }

            // 11. Gerar Currículo Adaptado (Local AI)
            const adaptedResume = this.generateAdaptedResume(user, job, matchingSkills, jobSkills);

            return {
                score: totalScore,
                breakdown: {
                    hardSkills: Math.round(hardSkillsScore),
                    keywords: Math.round(keywordsScore),
                    experience: Math.round(experienceScore)
                },
                classification,
                chanceOfPassing,
                riskLevel,
                feedback,
                strengths: strengths.slice(0, 6),
                gaps: gaps.slice(0, 8),
                optimizationPoints: optimizationPoints.slice(0, 5),
                keywords: {
                    found: matchingSkills,
                    missing: missingSkills
                },
                adaptedResume
            };
        } catch (error) {
            console.error('[AiService] Erro CRÍTICO ao analisar vaga:', error);
            // Lança exceção HTTP apropriada para que o frontend receba mensagem de erro
            throw new InternalServerErrorException(`Erro interno na análise IA: ${error.message}`);
        }
    }

    private generateAdaptedResume(user: any, job: any, matchingSkills: string[], jobSkills: string[]): string {
        const title = job.title || 'Profissional';
        const company = job.company?.name || 'Empresa';

        const userSkillsList = user.skills || [];

        // Priorizar skills que deram match
        const highlightSkills = [...matchingSkills, ...userSkillsList]
            .filter((value, index, self) => self.indexOf(value) === index) // Unique
            .slice(0, 15) // Top 15
            .join(', ');

        return `
# ${user.fullName}
${user.email} | ${user.linkedinUrl || 'LinkedIn'}

## Resumo Profissional
Profissional focado em ${title}, com experiência em tecnologias como ${highlightSkills}. 
Atualmente busco contribuir com a ${company} aplicando meus conhecimentos em ${matchingSkills.slice(0, 3).join(', ')}.
Minha trajetória é marcada por adaptação rápida e foco em resultados.

## Habilidades Técnicas
**Destaques:** ${highlightSkills}.
**Outras Competências:** ${userSkillsList.filter((s: string) => !matchingSkills.includes(s)).slice(0, 5).join(', ')}.

## Experiência Profissional
*(Adapte esta seção com suas experiências mais recentes relevantes para ${title})*

## Formação Acadêmica
*(Liste sua formação aqui)*
        `.trim();
    }
}
