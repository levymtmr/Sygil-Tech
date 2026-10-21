import type { FurnitureId } from '../types/game';

export const furnitureCatalog: Record<FurnitureId, {
    name: string;
    icon: string;
    price: number;
    description: string;
}> = {
    plant: { name: 'Vaso do bosque', icon: '✿', price: 8, description: 'Decoração natural.' },
    rug: { name: 'Tapete de entrada', icon: '▧', price: 11, description: 'Define um espaço acolhedor.' },
    lamp: { name: 'Lamparina', icon: '◉', price: 15, description: 'Ilumina o ambiente.' },
    counter: { name: 'Balcão de madeira', icon: '▰', price: 20, description: 'Organiza o atendimento.' },
    workbench: { name: 'Bancada de ofício', icon: '⚒', price: 24, description: 'Peça central da oficina.' }
};
