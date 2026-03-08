export interface Generation {
    id: number;
    name: string;
    region: string;
    offset: number;
    limit: number;
    startId: number;
    endId: number;
    mascotId: number;
}

export const GENERATIONS: Generation[] = [
    { id: 1, name: 'Gen I', region: 'Kanto', offset: 0, limit: 151, startId: 1, endId: 151, mascotId: 1 },
    { id: 2, name: 'Gen II', region: 'Johto', offset: 151, limit: 100, startId: 152, endId: 251, mascotId: 152 },
    { id: 3, name: 'Gen III', region: 'Hoenn', offset: 251, limit: 135, startId: 252, endId: 386, mascotId: 252 },
    { id: 4, name: 'Gen IV', region: 'Sinnoh', offset: 386, limit: 107, startId: 387, endId: 493, mascotId: 387 },
    { id: 5, name: 'Gen V', region: 'Unova', offset: 493, limit: 156, startId: 494, endId: 649, mascotId: 494 },
    { id: 6, name: 'Gen VI', region: 'Kalos', offset: 649, limit: 72, startId: 650, endId: 721, mascotId: 650 },
    { id: 7, name: 'Gen VII', region: 'Alola', offset: 721, limit: 88, startId: 722, endId: 809, mascotId: 722 },
    { id: 8, name: 'Gen VIII', region: 'Galar', offset: 809, limit: 89, startId: 810, endId: 898, mascotId: 810 },
    { id: 9, name: 'Gen IX', region: 'Paldea', offset: 898, limit: 127, startId: 899, endId: 1025, mascotId: 906 },
];
