import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

export interface ExtractedResumeData {
    text: string;
    skills: string[];
    headline?: string;
    bio?: string;
}

@Injectable()
export class ResumeParserService {
    private readonly logger = new Logger(ResumeParserService.name);

    // Lista de skills de tecnologia expandida
    private readonly COMMON_SKILLS = [
        // Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'Elixir',
        // Frontend
        'React', 'Angular', 'Vue', 'Next.js', 'NestJS', 'Svelte', 'Nuxt', 'HTML', 'CSS', 'Sass', 'Less', 'Tailwind', 'Bootstrap', 'Material UI', 'Redux', 'Zustand',
        // Backend
        'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'FastAPI', 'Laravel', 'Rails', 'GraphQL', 'Apollo',
        // Cloud & DevOps
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CircleCI', 'GitHub Actions', 'Nginx', 'Apache',
        // Database
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase', 'Prisma', 'TypeORM', 'Mongoose',
        // Mobile
        'React Native', 'Flutter', 'Ionic', 'Android', 'iOS',
        // Tools & Concepts
        'Git', 'CI/CD', 'Agile', 'Scrum', 'Kanban', 'TDD', 'DDD', 'Clean Architecture', 'Microservices', 'Serverless', 'Rest API', 'WebSockets',
        // Data & ML
        'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Spark', 'Hadoop'
    ];

    async parseResume(filePath: string): Promise<ExtractedResumeData> {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            const text = data.text;

            return {
                text,
                skills: this.extractSkills(text),
                headline: this.extractHeadline(text),
                bio: this.extractBio(text),
            };
        } catch (error) {
            this.logger.error(`Error parsing resume PDF: ${error.message}`, error.stack);
            return { text: '', skills: [] };
        }
    }

    private extractSkills(text: string): string[] {
        const foundSkills = new Set<string>();

        this.COMMON_SKILLS.forEach(skill => {
            // Escapar caracteres especiais para regex (ex: C++, C#)
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let regex: RegExp;
            // Ajuste para C++, C#, .NET, etc
            if (['C++', 'C#', '.NET'].includes(skill)) {
                regex = new RegExp(`\\b${escapedSkill}`, 'i');
            } else {
                regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            }

            if (regex.test(text)) {
                foundSkills.add(skill);
            }
        });

        return Array.from(foundSkills);
    }

    private extractHeadline(text: string): string | undefined {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Expanded keywords
        const roleKeywords = [
            'Developer', 'Engineer', 'Architect', 'Manager', 'Lead', 'Designer', 'Analyst', 'Consultant',
            'Specialist', 'Administrator', 'Director', 'CTO', 'VP', 'Head of', 'Scientist', 'Tester', 'QA'
        ];

        // Search in first 20 lines
        for (let i = 0; i < Math.min(lines.length, 20); i++) {
            const line = lines[i];

            // Priority 1: Line contains a keyword and is short enough
            if (line.length < 80 && roleKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(line))) {
                return line;
            }
        }

        // Fallback: If the user just has "Name" on line 1 and "Role" on line 2 (without specific keywords sometimes)
        // Heuristic: 2nd or 3rd line, short, no email/phone chars
        if (lines.length > 1) {
            const candidate = lines[1];
            if (candidate.length < 50 && !candidate.includes('@') && !candidate.match(/\d{5,}/)) {
                return candidate;
            }
        }

        return undefined;
    }

    private extractBio(text: string): string | undefined {
        const lowerText = text.toLowerCase();
        // Expanded keywords for section headers
        const keywords = [
            'professional summary', 'executive summary', 'summary of qualifications', 'summary',
            'professional profile', 'profile', 'about me', 'about',
            'resumo profissional', 'resumo', 'perfil', 'objetivo'
        ];

        for (const keyword of keywords) {
            const regex = new RegExp(`(^|\\n)\\s*${keyword}`, 'i');
            const match = regex.exec(text); // Use exec on original text to keep case

            if (match) {
                let start = match.index + match[0].length;

                // Skip common separators like : - or newlines immediately after header
                while (start < text.length && /[:\-\s]/.test(text[start])) {
                    start++;
                }

                const excerpt = text.substring(start, start + 800).trim();

                // Simple heuristic to find end of section: 
                // Look for double newline or next likely section header
                // For now, simple double newline is often safest default
                const parts = excerpt.split(/\r?\n\s*\r?\n/);

                let bio = parts[0];
                if (bio.length < 20 && parts[1]) {
                    bio += " " + parts[1];
                }

                return bio.length > 20 ? bio : undefined;
            }
        }
        return undefined;
    }
}
