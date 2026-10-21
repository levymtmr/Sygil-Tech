import './style.css';
import { renderCompany } from './page';

const app = document.querySelector<HTMLDivElement>('#company-app')!;
app.innerHTML = renderCompany();

const menu = document.querySelector<HTMLButtonElement>('#menu-toggle')!;
const navigation = document.querySelector<HTMLElement>('#primary-navigation')!;
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  menu.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('is-open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    menu.click();
    menu.focus();
  }
});
