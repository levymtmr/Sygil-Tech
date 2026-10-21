const paths: Record<string, string> = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  diagonal: '<path d="M6 18 18 6M6 6h12v12"/>',
  connections: '<rect x="2" y="8" width="6" height="8" rx="2"/><rect x="16" y="8" width="6" height="8" rx="2"/><path d="M8 12h8M5 8V4h14v4M5 16v4h14v-4"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3zM20 2v4m-2-2h4"/>',
  data: '<path d="M4 20h17M6 16v-5M12 16V5M18 16V9"/><circle cx="6" cy="8" r="1"/><circle cx="18" cy="6" r="1"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
export function symbol(name: string) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.arrow}</svg>`;
}

export function brandMark() {
  return '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m20 3 17 17-17 17L3 20z" stroke="currentColor" stroke-width="1.4"/><path d="m25 11-13 9h16l-13 9" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>';
}
