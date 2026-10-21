import { english } from './translations';

export type Language = 'en' | 'pt';
const storageKey = 'sygil-language';

export function savedLanguage(): Language {
  try { return localStorage.getItem(storageKey) === 'pt' ? 'pt' : 'en'; }
  catch { return 'en'; }
}

export function applyLanguage(root: HTMLElement, language: Language) {
  const translate = (value: string) => {
    const text = value.trim();
    const translated = english[text] ?? (text.startsWith('Possíveis entregas de ')
      ? `Possible deliverables for ${english[text.slice('Possíveis entregas de '.length)] ?? text.slice('Possíveis entregas de '.length)}` : text);
    return value.replace(text, translated);
  };
  if (language === 'en') {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent?.trim()) node.textContent = translate(node.textContent);
    }
    root.querySelectorAll('[aria-label], [alt]').forEach(element => {
      for (const attribute of ['aria-label', 'alt']) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, translate(value));
      }
    });
  }
  document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
  document.title = language === 'en' ? 'Sygil Tech — AI for business' : 'Sygil Tech — IA aplicada ao negócio';
  const description = language === 'en'
    ? 'Enterprise AI integration experience with OpenAI and Anthropic. Sygil Tech builds products, connects data and helps businesses improve efficiency.'
    : 'Experiência em integração de IA com OpenAI e Anthropic. A Sygil Tech desenvolve produtos, conecta dados e ajuda empresas a melhorar sua eficiência.';
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  root.querySelectorAll<HTMLButtonElement>('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  try { localStorage.setItem(storageKey, language); } catch { /* Browsing without storage still supports switching. */ }
}
