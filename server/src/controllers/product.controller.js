const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, costPrice, stock, barbershopId } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                stock: parseInt(stock),
                barbershopId
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Get Products (with optional low stock warning)
exports.getProducts = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const products = await prisma.product.findMany({
            where: { barbershopId },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, costPrice, stock } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                stock: parseInt(stock)
            }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};
