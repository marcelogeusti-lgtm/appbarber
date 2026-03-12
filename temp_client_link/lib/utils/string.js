export const normalizeString = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD') // Decompose accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric (masks, spaces)
};
