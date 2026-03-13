const prisma = require('../lib/prisma');

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, costPrice, stock, barbershopId, active, imageUrl, isFeatured } = req.body;

        // --- DO NOT MODIFY: CRITICAL FOR PRODUCT PERSISTENCE ---
        // This block handles numeric parsing and validation. 
        // Modifying this without careful testing may cause products to stop saving.
        if (!name || price === undefined || !barbershopId) {
            return res.status(400).json({ message: 'Name, price and barbershopId are required' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price) || 0,
                costPrice: (costPrice && costPrice !== '') ? parseFloat(costPrice) : null,
                stock: stock ? parseInt(stock) : 0,
                active: active !== undefined ? active : true,
                imageUrl,
                isFeatured: isFeatured || false,
                barbershopId
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create Product error:', error);
        res.status(500).json({ message: 'Error creating product: ' + error.message });
    }
};

// Get Products (with optional low stock warning)
exports.getProducts = async (req, res) => {
    try {
        const { barbershopId, page = 1, limit = 25 } = req.query;

        // Security: Prevent listing all products if no shop is specified
        if (!barbershopId) {
            return res.status(400).json({ message: 'Barbershop ID is required' });
        }

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const where = {
            barbershopId,
            active: true
        };

        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy: { name: 'asc' },
                skip,
                take: l
            })
        ]);

        res.json({
            data: products,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        console.error('Get Products error:', error);
        res.status(500).json({ message: 'Error fetching products: ' + error.message });
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
                price: price !== undefined ? parseFloat(price) : undefined,
                costPrice: (costPrice !== undefined) ? (costPrice && costPrice !== '' ? parseFloat(costPrice) : null) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                active,
                imageUrl,
                isFeatured: isFeatured !== undefined ? isFeatured : undefined
            }
        });

        res.json(product);
    } catch (error) {
        console.error('Update Product error:', error);
        res.status(500).json({ message: 'Error updating product: ' + error.message });
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
