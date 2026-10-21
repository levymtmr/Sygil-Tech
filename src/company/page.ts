import { company, services, experienceOutcomes } from './content';
import { brandMark, symbol } from './icons';
import { architectureDiagram } from './diagram';

export function renderCompany() {
  const contact = company.contact;
  return `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="site-header"><div class="container header-inner">
      <a href="#inicio" class="brand-lockup" aria-label="Sygil Tech — início">${brandMark()}<span>SYGIL<small>TECH</small></span></a>
      <button id="menu-toggle" class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span></button>
      <nav id="primary-navigation" aria-label="Navegação principal"><a href="#servicos">O que fazemos</a><a href="#sobre">Experiência</a><a href="#contato" class="nav-contact">Vamos conversar ${symbol('diagonal')}</a></nav>
      <div class="language-switch" role="group" aria-label="Language / Idioma"><button type="button" data-language="en" lang="en" aria-label="English">EN</button><button type="button" data-language="pt" lang="pt-BR" aria-label="Português">PT</button></div>
    </div></header>
    <main id="conteudo">
      <section class="hero container" id="inicio">
        <div class="hero-copy"><p class="eyebrow"><span class="small-sigil">✳</span> ${company.tagline}</p>
          <h1>IA que conecta<br>produtos, dados<br><em>e resultados.</em></h1>
          <p class="hero-description">Integração com OpenAI e Anthropic para desenvolver produtos, apoiar análises e encontrar oportunidades de eficiência na sua empresa.</p>
          <div class="hero-actions"><a class="button button-dark" href="#contato">Aplicar IA ao meu negócio ${symbol('diagonal')}</a><a class="text-link" href="#sobre">Conheça a experiência ${symbol('arrow')}</a></div>
          <div class="hero-footnote"><span class="line-mark"></span> Experiência em projetos da Ambev / AB InBev.</div>
        </div>
        ${architectureDiagram()}
      </section>
      <div class="expertise-strip"><div class="container"><span>MODELOS, DADOS E SISTEMAS CONECTADOS</span><span>OpenAI <i>✳</i> Anthropic <i>✳</i> APIs <i>✳</i> Dados</span></div></div>
      <section class="about-section" id="sobre"><div class="container about-inner"><div><p class="eyebrow">01 / EXPERIÊNCIA PROFISSIONAL</p><h2>Uma API.<br>Dois provedores.<br><em>Muitos times.</em></h2></div><div class="about-copy"><p class="about-lead">Integração de OpenAI e Anthropic para a AB InBev.</p><p>Levy Mota Moreira foi responsável pelo desenvolvimento de uma API de integração que reuniu os recursos da OpenAI e da Anthropic em uma interface padrão para consumo pelos times da AB InBev.</p><p>Em vez de cada time integrar os provedores separadamente, a solução permitiu acessar seus recursos por uma única API. Essa centralização apoiou a redução de custos e a segurança da informação.</p><p>É essa experiência em conectar IA a um ambiente corporativo que orienta a Sygil Tech: simplificar o acesso à tecnologia e aplicá-la aos objetivos de cada empresa.</p><div class="about-principle">${brandMark()}<span>Conectar modelos e equipes.<br><b>Transformar integração em valor.</b></span></div><p class="experience-attribution">Experiência profissional de Levy Mota Moreira em projetos da Ambev / AB InBev.</p></div></div><div class="container experience-outcomes" aria-label="Como essa experiência pode ajudar a sua empresa">${experienceOutcomes.map((item, index) => `<article><span>0${index + 1}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div></section>
      <section class="services-section container section-spacing" id="servicos">
        <div class="section-intro"><p class="eyebrow">02 / COMO PODEMOS AJUDAR</p><h2>Da experiência<br>técnica ao<br><em>valor de negócio.</em></h2><p>O ponto de partida é o desafio da sua empresa: desenvolver um produto, entender informações ou tornar um processo mais eficiente.</p><a class="text-link" href="#contato">Conte a sua ideia ${symbol('arrow')}</a></div>
        <div class="services-list">${services.map(service => `<article class="service" id="${service.id}"><span class="service-number">${service.number}</span><div class="service-content"><div class="service-title"><h3>${service.name}</h3><span class="service-icon">${symbol(service.icon)}</span></div><h4>${service.summary}</h4><p>${service.description}</p><ul aria-label="Possíveis entregas de ${service.name}">${service.deliverables.map(item => `<li>${item}</li>`).join('')}</ul></div></article>`).join('')}</div>
      </section>
      <section class="process-section container"><div class="process-heading"><p class="eyebrow">DA CONVERSA À CONSTRUÇÃO</p><h2>Definir o objetivo.<br><em>Acompanhar o impacto.</em></h2></div><ol class="process-list"><li><span>01</span><h3>Entender</h3><p>Conversar sobre o contexto, as necessidades e o resultado que você quer alcançar.</p></li><li><span>02</span><h3>Conectar</h3><p>Definir o escopo e a combinação de sistemas, dados e tecnologia para o projeto.</p></li><li><span>03</span><h3>Construir</h3><p>Desenvolver, validar e acompanhar indicadores de qualidade, uso e impacto no negócio.</p></li></ol></section>
      <section class="contact-section" id="contato"><div class="container contact-inner"><div><p class="eyebrow">03 / VAMOS CONVERSAR</p><h2>Onde a IA pode<br>fazer diferença<br><em>na sua empresa?</em></h2><p>Um novo produto, uma análise ou um processo que custa tempo demais.<br>Vamos entender o desafio e avaliar um caminho.</p></div><div class="contact-card"><span class="contact-card-mark">${brandMark()}</span><p>Produtos, análises e eficiência operacional.</p><h3>Vamos encontrar<br>o seu caso de uso?</h3>${contact ? `<a class="button button-light" href="${contact.href}">${contact.label} ${symbol('diagonal')}</a><small>${contact.description}</small>` : '<p class="contact-pending">Novos canais de contato em breve.</p><small>Estamos preparando os canais oficiais da Sygil Tech.</small>'}</div></div></section>
    </main>
    <footer class="site-footer"><div class="container footer-inner"><a href="#inicio" class="brand-lockup" aria-label="Sygil Tech — voltar ao início">${brandMark()}<span>SYGIL<small>TECH</small></span></a><p>IA aplicada a objetivos de negócio.</p><span>© ${new Date().getFullYear()} Sygil Tech</span><nav class="footer-links" aria-label="Links do rodapé"><a href="#contato">Contato</a><a id="fun" href="./projetos/astera/">Lendas de Astera</a></nav></div></footer>`;
}
