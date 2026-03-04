const prisma = require('../lib/prisma');

exports.listAddresses = async (req, res) => {
    try {
        const clientId = req.user.id;
        const addresses = await prisma.clientAddress.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(addresses);
    } catch (error) {
        console.error('List Addresses Error:', error);
        res.status(500).json({ message: 'Erro ao buscar endereços.' });
    }
};

exports.getAddressById = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user.id;

        const address = await prisma.clientAddress.findFirst({
            where: { id, clientId }
        });

        if (!address) return res.status(404).json({ message: 'Endereço não encontrado.' });

        res.json(address);
    } catch (error) {
        console.error('Get Address Error:', error);
        res.status(500).json({ message: 'Erro ao buscar endereço.' });
    }
};

exports.createAddress = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { zipCode, street, number, complement, neighborhood, city, state, isDefault } = req.body;

        if (!zipCode || !street || !number || !neighborhood || !city || !state) {
            return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
        }

        // If isDefault is true, unset other defaults
        if (isDefault) {
            await prisma.clientAddress.updateMany({
                where: { clientId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const address = await prisma.clientAddress.create({
            data: {
                clientId,
                zipCode,
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
                isDefault: isDefault || false
            }
        });

        res.status(201).json(address);
    } catch (error) {
        console.error('Create Address Error:', error);
        res.status(500).json({ message: 'Erro ao criar endereço.' });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user.id;
        const { zipCode, street, number, complement, neighborhood, city, state, isDefault } = req.body;

        const existingAddress = await prisma.clientAddress.findFirst({
            where: { id, clientId }
        });

        if (!existingAddress) return res.status(404).json({ message: 'Endereço não encontrado.' });

        if (isDefault && !existingAddress.isDefault) {
            await prisma.clientAddress.updateMany({
                where: { clientId, isDefault: true },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.clientAddress.update({
            where: { id },
            data: {
                zipCode,
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
                isDefault
            }
        });

        res.json(updatedAddress);
    } catch (error) {
        console.error('Update Address Error:', error);
        res.status(500).json({ message: 'Erro ao atualizar endereço.' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user.id;

        const address = await prisma.clientAddress.findFirst({
            where: { id, clientId }
        });

        if (!address) return res.status(404).json({ message: 'Endereço não encontrado.' });

        await prisma.clientAddress.delete({ where: { id } });

        res.json({ message: 'Endereço removido com sucesso.' });
    } catch (error) {
        console.error('Delete Address Error:', error);
        res.status(500).json({ message: 'Erro ao remover endereço.' });
    }
};

exports.setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.user.id;

        await prisma.$transaction([
            prisma.clientAddress.updateMany({
                where: { clientId, isDefault: true },
                data: { isDefault: false }
            }),
            prisma.clientAddress.update({
                where: { id },
                data: { isDefault: true }
            })
        ]);

        res.json({ message: 'Endereço padrão atualizado.' });
    } catch (error) {
        console.error('Set Default Address Error:', error);
        res.status(500).json({ message: 'Erro ao definir endereço padrão.' });
    }
};
