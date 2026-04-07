const prisma = require('../lib/prisma');

class TutorialService {
    static async create(data) {
        return prisma.tutorial.create({
            data: {
                title: data.title,
                description: data.description,
                url: data.url,
                category: data.category,
                duration: data.duration,
                status: data.status || 'published',
                order: data.order || 0,
                active: data.active !== undefined ? data.active : true
            }
        });
    }

    static async list(filters = {}) {
        const where = {
            active: true
        };

        if (filters.category && filters.category !== 'all') {
            where.category = filters.category;
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        return prisma.tutorial.findMany({
            where,
            orderBy: {
                order: 'asc'
            }
        });
    }

    static async getById(id) {
        return prisma.tutorial.findUnique({
            where: { id }
        });
    }

    static async update(id, data) {
        return prisma.tutorial.update({
            where: { id },
            data
        });
    }

    static async delete(id) {
        return prisma.tutorial.delete({
            where: { id }
        });
    }

    static async listAdmin() {
        return prisma.tutorial.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}

module.exports = TutorialService;
