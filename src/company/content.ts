export const company = {
  name: 'Sygil Tech',
  tagline: 'Inteligência artificial aplicada ao negócio.',
  description: 'Integração das APIs da OpenAI e da Anthropic, desenvolvimento de produtos, análise de dados e eficiência operacional. Conheça a experiência por trás da Sygil Tech.',
  github: 'https://github.com/levymtmr',
  contact: null as { label: string; href: string; description: string } | null,
};

export const services = [
  {
    id: 'llms', number: '01', name: 'IA integrada ao seu produto',
    summary: 'Da possibilidade técnica a uma funcionalidade útil.',
    description: 'Integração das APIs da OpenAI e da Anthropic a aplicações e fluxos de trabalho. Um caminho para validar ideias, criar funcionalidades com IA e conectá-las ao contexto da sua empresa.',
    deliverables: ['Integração com LLMs', 'Provas de conceito', 'Funcionalidades de IA'],
    icon: 'spark',
  },
  {
    id: 'dados', number: '02', name: 'Dados para apoiar decisões',
    summary: 'Mais contexto para entender cenários e prioridades.',
    description: 'Análise de dados e uso de modelos de linguagem para apoiar a exploração, a organização e a síntese de informações. Soluções orientadas às perguntas que o negócio precisa responder.',
    deliverables: ['Análise exploratória', 'Síntese de informações', 'Relatórios e visualizações'],
    icon: 'data',
  },
  {
    id: 'eficiencia', number: '03', name: 'Eficiência & oportunidades de economia',
    summary: 'Encontrar onde a tecnologia pode reduzir esforço e desperdício.',
    description: 'Avaliação de processos repetitivos, oportunidades de automação e consumo de serviços de IA. O trabalho começa por entender os custos atuais e definir como medir o impacto das mudanças.',
    deliverables: ['Automação de tarefas', 'Avaliação do uso de IA', 'Indicadores de impacto'],
    icon: 'layers',
  },
  {
    id: 'apis', number: '04', name: 'APIs & back-end para conectar tudo',
    summary: 'A estrutura para levar as integrações à aplicação.',
    description: 'Desenvolvimento de APIs, serviços e regras de negócio para conectar modelos, dados e sistemas existentes. Uma base para transformar a ideia em uma solução integrada.',
    deliverables: ['APIs sob medida', 'Integração entre sistemas', 'Desenvolvimento back-end'],
    icon: 'connections',
  },
] as const;

export const experienceOutcomes = [
  { title: 'Desenvolver produtos', text: 'Explorar funcionalidades com IA, validar hipóteses e conectar modelos às aplicações da empresa.' },
  { title: 'Apoiar análises', text: 'Organizar e explorar informações para dar mais contexto às decisões e ao trabalho das equipes.' },
  { title: 'Buscar eficiência', text: 'Identificar tarefas repetitivas e oportunidades de redução de custos, com impacto acompanhado por indicadores.' },
];
