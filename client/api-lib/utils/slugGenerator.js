const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

/**
 * Generates a unique slug for a barbershop.
 * If the generated slug exists, appends a counter (e.g., -1, -2).
 * 
 * @param {import('@prisma/client').PrismaClient} prisma 
 * @param {string} name 
 * @param {string} [ignoreId] - ID to ignore (for updates)
 * @returns {Promise<string>}
 */
const generateUniqueSlug = async (prisma, name, ignoreId = null) => {
    let slug = slugify(name);
    let originalSlug = slug;
    let counter = 1;
    let exists = true;

    while (exists) {
        const where = { slug };
        if (ignoreId) {
            where.NOT = { id: ignoreId };
        }

        const existing = await prisma.barbershop.findUnique({
            where,
            select: { id: true } // Optimization: select only ID
        });

        if (!existing) {
            exists = false;
        } else {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
    }

    return slug;
};

module.exports = { generateUniqueSlug, slugify };
