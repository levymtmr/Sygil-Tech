export const company = {
  name: 'Sygil Tech',
  tagline: 'Engenharia de software. Inteligência aplicada.',
  description: 'Desenvolvimento de APIs, back-end, integrações com LLMs e análise de dados. Soluções digitais pensadas para conectar sistemas e transformar ideias em produtos.',
  github: 'https://github.com/levymtmr',
  contact: null as { label: string; href: string; description: string } | null,
};

export const services = [
  {
    id: 'apis', number: '01', name: 'APIs & integrações',
    summary: 'Seus sistemas, na mesma conversa.',
    description: 'Desenvolvimento de APIs e integrações para conectar aplicações, compartilhar informações e dar continuidade aos processos do seu negócio.',
    deliverables: ['APIs sob medida', 'Integração entre sistemas', 'Documentação técnica'],
    icon: 'connections',
  },
  {
    id: 'backend', number: '02', name: 'Desenvolvimento back-end',
    summary: 'Uma estrutura sólida para o seu produto.',
    description: 'Lógica de negócio, serviços e organização de dados para sustentar aplicações e transformar requisitos em funcionalidades que fazem sentido.',
    deliverables: ['Regras de negócio', 'Serviços e aplicações', 'Evolução de sistemas'],
    icon: 'layers',
  },
  {
    id: 'llms', number: '03', name: 'Integração com LLMs',
    summary: 'Inteligência artificial com uma função clara.',
    description: 'Integração de modelos de linguagem às suas aplicações para apoiar tarefas, trabalhar com informações e criar experiências mais úteis.',
    deliverables: ['Assistentes integrados', 'Fluxos com IA', 'Provas de conceito'],
    icon: 'spark',
  },
  {
    id: 'dados', number: '04', name: 'Análise de dados',
    summary: 'Informação que ajuda a enxergar o próximo passo.',
    description: 'Organização, exploração e análise de dados para entender cenários, encontrar padrões e apoiar decisões com mais contexto.',
    deliverables: ['Análises exploratórias', 'Relatórios e visualizações', 'Tratamento de dados'],
    icon: 'data',
  },
] as const;
