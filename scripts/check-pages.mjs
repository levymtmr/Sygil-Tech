import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
const pages = [
  ['index.html', 'Sygil Tech'],
  ['projetos/astera/index.html', 'Lendas de Astera'],
];

for (const [path, title] of pages) {
  const file = resolve(root, path);
  assert.ok(existsSync(file), `Página não gerada: ${path}`);
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes(title), `Título incorreto: ${path}`);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|#|mailto:|data:)/.test(url)) continue;
    const asset = resolve(dirname(file), url.split(/[?#]/)[0]);
    assert.ok(asset.startsWith(root + sep), `Recurso fora do site: ${url}`);
    assert.ok(existsSync(asset), `Recurso ausente em ${path}: ${url}`);
  }
  console.log(`Página e recursos OK: ${path}`);
}
