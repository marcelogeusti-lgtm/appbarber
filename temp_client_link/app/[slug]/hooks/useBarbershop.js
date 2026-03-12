import { useState, useEffect } from 'react';
import api from '../../../lib/clientApi';

export function useBarbershop(slug) {
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    // Helper to decode slug if needed
    const effectiveSlug = slug ? decodeURIComponent(slug) : null;

    useEffect(() => {
        if (!effectiveSlug) return;

        async function loadBarbershop() {
            setLoading(true);
            try {
                const res = await api.get(`/barbershops/${effectiveSlug}`);
                setBarbershop(res.data);

                // Trigger parallel loads
                loadProducts(res.data.id);
                if (localStorage.getItem('clientToken')) {
                    checkFavoriteStatus(res.data.id);
                }
            } catch (err) {
                console.error("Error loading barbershop:", err);
            } finally {
                setLoading(false);
            }
        }

        loadBarbershop();
    }, [effectiveSlug]);

    async function loadProducts(id) {
        try {
            const prodRes = await api.get(`/products?barbershopId=${id}`);
            setProducts(prodRes.data);
        } catch (e) {
            console.error('Error loading products', e);
        }
    }

    async function checkFavoriteStatus(id) {
        try {
            const res = await api.get(`/barbershops/${id}/favorite-status`);
            setIsFavorite(res.data.favorited);
        } catch (err) {
            console.error("Error checking favorite status", err);
        }
    }

    const toggleFavorite = async () => {
        if (!barbershop) return;
        const token = localStorage.getItem('clientToken');
        if (!token) {
            alert('Faça login para favoritar.'); // Ideally replace with toast
            return;
        }

        try {
            const res = await api.post(`/barbershops/${barbershop.id}/favorite`);
            setIsFavorite(res.data.favorited);
        } catch (error) {
            console.error(error);
            alert('Erro ao processar favorito.');
        }
    };

    return {
        barbershop,
        loading,
        products,
        isFavorite,
        toggleFavorite
    };
}
