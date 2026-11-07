import { brandMark } from '../company/icons';
import './style.css';
export function header(home=false) {
 return `<header class="play-header"><a class="play-brand" href="${home?'../':'../../'}" aria-label="Sygil Tech — início">${brandMark()}<span>SYGIL<small>TECH</small></span></a><a class="back-link" href="${home?'../':'../../play/'}">← ${home?'Site da Sygil Tech':'Escolher outro jogo'}</a></header>`;
}
