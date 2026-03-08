const colors: Record<string, string> = {
    normal: '#919AA2',
    fire: '#FF9D55',
    water: '#5090D6',
    electric: '#F4D23C',
    grass: '#63BC5A',
    ice: '#73CEC0',
    fighting: '#CE416B',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#89AAE3',
    psychic: '#FA7179',
    bug: '#91C12F',
    rock: '#C5B78C',
    ghost: '#5269AD',
    dragon: '#0B6DC3',
    dark: '#5A5465',
    steel: '#5A8EA2',
    fairy: '#EC8FE6',
};

export const getColorsByType = (type: string): string => {
    return colors[type.toLowerCase()] || '#A8A77A'; // default to normal
};

export const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
