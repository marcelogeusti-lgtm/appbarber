const prisma = require('../lib/prisma');

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, costPrice, stock, barbershopId, active } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                stock: parseInt(stock),
                active: active !== undefined ? active : true,
                imageUrl,
                isFeatured: isFeatured || false,
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

        // Security: Prevent listing all products if no shop is specified
        if (!barbershopId) {
            return res.status(400).json({ message: 'Barbershop ID is required' });
        }

        const products = await prisma.product.findMany({
            where: {
                barbershopId,
                active: true,
                stock: { gt: 0 }
            },
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
        const { name, description, price, costPrice, stock, active, imageUrl, isFeatured } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                costPrice: costPrice ? parseFloat(costPrice) : null,
                stock: parseInt(stock),
                active,
                imageUrl,
                isFeatured: isFeatured !== undefined ? isFeatured : undefined
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
