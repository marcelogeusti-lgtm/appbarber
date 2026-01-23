const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- COURSES ---

exports.listCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const data = req.body;
        const course = await prisma.course.create({ data });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const course = await prisma.course.update({
            where: { id },
            data
        });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Curso removido' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- BANNERS ---

exports.listBanners = async (req, res) => {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const data = req.body;
        // Ensure dates are parsed if string
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const banner = await prisma.banner.create({ data });
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const banner = await prisma.banner.update({
            where: { id },
            data
        });
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.banner.delete({ where: { id } });
        res.json({ message: 'Banner removido' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SYSTEM UPDATES ---

exports.listUpdates = async (req, res) => {
    try {
        const updates = await prisma.systemUpdate.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { readBy: true } } }
        });
        res.json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUpdate = async (req, res) => {
    try {
        const data = req.body;
        const update = await prisma.systemUpdate.create({ data });
        res.status(201).json(update);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.systemUpdate.delete({ where: { id } });
        res.json({ message: 'Update removido' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
