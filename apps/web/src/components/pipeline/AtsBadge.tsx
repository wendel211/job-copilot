import { Badge } from '@/components/ui/Badge';

// Mapeamento de cores e labels para os ATS mais famosos
const atsConfig: Record<
  string,
  { label: string; color: string; tip: string }
> = {
  greenhouse: {
    label: 'Greenhouse',
    color: 'bg-green-100 text-green-800 border-green-200',
    tip: 'Dica: Greenhouse valoriza palavras-chave exatas. Evite colunas duplas.',
  },
  lever: {
    label: 'Lever',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    tip: 'Dica: Lever foca em clareza. Use bullet points simples.',
  },
  workday: {
    label: 'Workday',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    tip: 'Dica: O pior de todos. Crie uma conta antes de tentar aplicar.',
  },
  gupy: {
    label: 'Gupy',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    tip: 'Dica: A IA da Gupy ama soft skills. Preencha todos os testes.',
  },
  unknown: {
    label: 'Desconhecido',
    color: 'bg-gray-50 text-gray-500 border-gray-100',
    tip: 'Site próprio ou email direto.',
  },
};

interface AtsBadgeProps {
  type: string;
}

export function AtsBadge({ type }: AtsBadgeProps) {
  const config = atsConfig[type?.toLowerCase()] || atsConfig.unknown;

  return (
    <div
      className="relative inline-flex group"
      tabIndex={0}
      aria-label={`ATS utilizado: ${config.label}`}
    >
      {/* Badge */}
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded border ${config.color}`}
      >
        {config.label}
      </span>

      {/* Tooltip */}
      <div
        className="
          pointer-events-none
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          w-52 p-2
          bg-gray-800 text-white text-xs rounded-md shadow-lg
          opacity-0 translate-y-1
          group-hover:opacity-100 group-hover:translate-y-0
          group-focus:opacity-100 group-focus:translate-y-0
          transition-all duration-150 ease-out
          z-40
        "
        role="tooltip"
      >
        {config.tip}

        {/* Arrow */}
        <div
          className="
            absolute top-full left-1/2 -translate-x-1/2
            border-4 border-transparent border-t-gray-800
          "
        />
      </div>
    </div>
  );
}
