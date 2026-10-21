import { company, services } from './content';
import { brandMark, symbol } from './icons';
import { architectureDiagram } from './diagram';
import asteraPreview from './assets/astera-preview.png';

export function renderCompany() {
  const contact = company.contact;
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="site-header"><div class="container header-inner">
      <a href="#inicio" class="brand-lockup" aria-label="Sygil Tech — início">${brandMark()}<span>SYGIL<small>TECH</small></span></a>
      <button id="menu-toggle" class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span></button>
      <nav id="primary-navigation" aria-label="Navegação principal"><a href="#servicos">O que fazemos</a><a href="#sobre">Sobre a Sygil</a><a href="#projetos">Projetos</a><a href="#contato" class="nav-contact">Vamos conversar ${symbol('diagonal')}</a></nav>
    </div></header>
    <main id="conteudo">
      <section class="hero container" id="inicio">
        <div class="hero-copy"><p class="eyebrow"><span class="small-sigil">✳</span> ${company.tagline}</p>
          <h1>Boas ideias merecem<br>tecnologia que<br><em>faz acontecer.</em></h1>
          <p class="hero-description">Conectamos sistemas, inteligência artificial e dados para construir soluções que fazem sentido para o seu negócio.</p>
          <div class="hero-actions"><a class="button button-dark" href="#contato">Vamos construir juntos ${symbol('diagonal')}</a><a class="text-link" href="#projetos">Explore nossos projetos ${symbol('arrow')}</a></div>
          <div class="hero-footnote"><span class="line-mark"></span> Do primeiro conceito à solução em funcionamento.</div>
        </div>
        ${architectureDiagram()}
      </section>
      <div class="expertise-strip"><div class="container"><span>DA IDEIA À IMPLEMENTAÇÃO</span><span>APIs <i>✳</i> Back-end <i>✳</i> LLMs <i>✳</i> Análise de dados</span></div></div>
      <section class="services-section container section-spacing" id="servicos">
        <div class="section-intro"><p class="eyebrow">01 / O QUE FAZEMOS</p><h2>Complexidade<br>por dentro.<br><em>Clareza por fora.</em></h2><p>Cada projeto pede uma combinação diferente. Estas são as frentes em que podemos trabalhar com você.</p><a class="text-link" href="#contato">Conte a sua ideia ${symbol('arrow')}</a></div>
        <div class="services-list">${services.map(service => `<article class="service" id="${service.id}"><span class="service-number">${service.number}</span><div class="service-content"><div class="service-title"><h3>${service.name}</h3><span class="service-icon">${symbol(service.icon)}</span></div><h4>${service.summary}</h4><p>${service.description}</p><ul aria-label="Possíveis entregas de ${service.name}">${service.deliverables.map(item => `<li>${item}</li>`).join('')}</ul></div></article>`).join('')}</div>
      </section>
      <section class="about-section" id="sobre"><div class="container about-inner"><div><p class="eyebrow">02 / A SYGIL TECH</p><h2>Uma ponte entre<br>o que você imagina<br>e o que <em>pode existir.</em></h2></div><div class="about-copy"><p class="about-lead">Software é uma forma de dar estrutura às ideias.</p><p>A Sygil Tech reúne desenvolvimento de APIs e back-end, integração com modelos de linguagem e análise de dados. O foco está em entender o problema e escolher como a tecnologia pode ajudar.</p><p>Projetos sob medida, com espaço para experimentar, organizar e evoluir. Da integração de um sistema à criação de uma nova experiência digital.</p><div class="about-principle">${brandMark()}<span>Entender o contexto.<br><b>Construir com propósito.</b></span></div></div></div></section>
      <section class="projects-section container section-spacing" id="projetos"><div class="section-heading"><div><p class="eyebrow">03 / IDEIAS EM MOVIMENTO</p><h2>Projetos que<br><em>ganham vida.</em></h2></div><p>Um espaço para conhecer o que construímos.<br>E experimentar, em primeira mão.</p></div>
        <article class="featured-project"><div class="project-art"><img src="${asteraPreview}" alt="Lendas de Astera: mapa do bosque em pixel art com criaturas, árvores e uma loja." loading="lazy" width="1265" height="711"/><div class="project-art-label"><span></span> EXPERIÊNCIA INTERATIVA</div><a class="project-play" href="./projetos/astera/" aria-label="Jogar Lendas de Astera">${symbol('arrow')}</a></div><div class="project-copy"><div class="project-meta"><span>PROJETO DA SYGIL TECH</span><span>JOGO PARA NAVEGADOR</span></div><h3>Lendas de <em>Astera</em></h3><p>Uma jornada de exploração e combate tático. Escolha sua classe, descubra o bosque e dê vida à sua própria loja em um mundo de pixel art.</p><ul class="project-tags"><li>TypeScript</li><li>Canvas 2D</li><li>Sprites animados</li></ul><a class="button button-dark" href="./projetos/astera/">Entrar no mundo de Astera ${symbol('diagonal')}</a><small>Jogue diretamente no navegador. Sem instalação.</small></div></article>
        <div class="project-afterword"><span>UM PROJETO PODE COMEÇAR COM UMA CONVERSA.</span><a class="text-link" href="#contato">Qual é a sua próxima ideia? ${symbol('arrow')}</a></div>
      </section>
      <section class="process-section container"><div class="process-heading"><p class="eyebrow">DA CONVERSA À CONSTRUÇÃO</p><h2>Um caminho com<br><em>o problema no centro.</em></h2></div><ol class="process-list"><li><span>01</span><h3>Entender</h3><p>Conversar sobre o contexto, as necessidades e o resultado que você quer alcançar.</p></li><li><span>02</span><h3>Conectar</h3><p>Definir o escopo e a combinação de sistemas, dados e tecnologia para o projeto.</p></li><li><span>03</span><h3>Construir</h3><p>Desenvolver, validar e preparar a solução para os próximos passos.</p></li></ol></section>
      <section class="contact-section" id="contato"><div class="container contact-inner"><div><p class="eyebrow">04 / VAMOS CONVERSAR</p><h2>O próximo projeto<br>pode começar<br><em>pela sua ideia.</em></h2><p>Conte o que você precisa conectar, construir ou entender.<br>Vamos encontrar um ponto de partida.</p></div><div class="contact-card"><span class="contact-card-mark">${brandMark()}</span><p>APIs, back-end, LLMs ou dados.</p><h3>O que vamos<br>construir juntos?</h3><a class="button button-light" href="${contact?.href ?? company.github}" ${contact ? '' : 'target="_blank" rel="noopener noreferrer"'}>${contact?.label ?? 'Conheça nosso GitHub'} ${symbol('diagonal')}</a><small>${contact?.description ?? 'Conheça os projetos e o desenvolvimento por trás da Sygil Tech.'}</small></div></div></section>
    </main>
    <footer class="site-footer"><div class="container footer-inner"><a href="#inicio" class="brand-lockup" aria-label="Sygil Tech — voltar ao início">${brandMark()}<span>SYGIL<small>TECH</small></span></a><p>Tecnologia para conectar ideias.</p><span>© ${new Date().getFullYear()} Sygil Tech</span><a href="${company.github}" target="_blank" rel="noopener noreferrer">GitHub ${symbol('diagonal')}</a></div></footer>`;
}
