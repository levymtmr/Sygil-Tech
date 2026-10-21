import './style.css';
import { renderCompany } from './page';
import { applyLanguage, savedLanguage, type Language } from './language';

const app = document.querySelector<HTMLDivElement>('#company-app')!;
const language = savedLanguage();
function render(language: Language) {
app.innerHTML = renderCompany();
applyLanguage(app, language);
app.querySelectorAll<HTMLButtonElement>('[data-language]').forEach(button => {
  button.addEventListener('click', () => {
    const next = button.dataset.language as Language;
    render(next);
    app.querySelector<HTMLButtonElement>(`[data-language="${next}"]`)?.focus();
  });
});

const menu = document.querySelector<HTMLButtonElement>('#menu-toggle')!;
const navigation = document.querySelector<HTMLElement>('#primary-navigation')!;
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', language === 'en' ? (expanded ? 'Close menu' : 'Open menu') : (expanded ? 'Fechar menu' : 'Abrir menu'));
  navigation.classList.toggle('is-open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));
navigation.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    menu.click();
    menu.focus();
  }
});

}
render(language);
