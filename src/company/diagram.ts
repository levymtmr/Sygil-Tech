import { symbol } from './icons';

export function architectureDiagram() {
  return `<div class="architecture" aria-label="Diagrama ilustrativo: APIs conectam aplicações, dados e modelos de inteligência artificial.">
    <div class="architecture-top"><span class="diagram-dot"></span><span>CONEXÕES QUE CRIAM POSSIBILIDADES</span><span class="diagram-cross">+</span></div>
    <div class="architecture-stage">
      <svg class="architecture-lines" viewBox="0 0 440 350" preserveAspectRatio="none" aria-hidden="true"><path d="M220 78V128M220 210V247M220 247H83V280M220 247H357V280M220 247V280"/><circle cx="220" cy="128" r="3"/><circle cx="220" cy="247" r="4"/></svg>
      <div class="diagram-application"><span class="application-icon">◫</span><div><small>O PONTO DE PARTIDA</small><b>Seu produto. Sua ideia.</b></div></div>
      <a class="diagram-core" href="#servicos"><span class="core-icon">${symbol('connections')}</span><span><small>O QUE CONECTA TUDO</small><b>Back-end & APIs</b></span>${symbol('diagonal')}</a>
      <div class="diagram-endpoints"><a href="#llms">${symbol('spark')}<b>LLMs</b><span>Inteligência</span></a><a href="#dados">${symbol('data')}<b>Dados</b><span>Contexto</span></a><a href="#apis">${symbol('layers')}<b>Sistemas</b><span>Integração</span></a></div>
    </div>
    <div class="architecture-bottom"><span>Uma base. Múltiplas soluções.</span><span>SYGIL / TECH</span></div>
  </div>`;
}
