const axios = require('axios');
const prisma = require('../lib/prisma');

const BASE_URL = 'https://api.cakto.com.br';

/**
 * Cliente da API pública da Cakto (cobrança das assinaturas SaaS).
 * Credenciais vêm do PlatformSetting (CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET),
 * configuráveis no painel Master. Sem credenciais → isConfigured() = false e
 * os fluxos dependentes degradam de forma segura (sem chamadas externas).
 */
class CaktoService {
    constructor() {
        this.token = null;
        this.tokenExpiresAt = 0;
        this.credentials = null;
        this.credentialsLoadedAt = 0;
    }

    async loadCredentials(force = false) {
        // Cache de 60s: settings podem mudar via painel Master em outra lambda
        if (!force && this.credentials && Date.now() - this.credentialsLoadedAt < 60_000) {
            return this.credentials;
        }
        const rows = await prisma.platformSetting.findMany({
            where: { key: { in: ['CAKTO_CLIENT_ID', 'CAKTO_CLIENT_SECRET'] } }
        });
        const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
        this.credentials = {
            clientId: map.CAKTO_CLIENT_ID || null,
            clientSecret: map.CAKTO_CLIENT_SECRET || null
        };
        this.credentialsLoadedAt = Date.now();
        return this.credentials;
    }

    async isConfigured() {
        const { clientId, clientSecret } = await this.loadCredentials();
        return Boolean(clientId && clientSecret);
    }

    refreshConfig() {
        this.credentials = null;
        this.token = null;
        this.tokenExpiresAt = 0;
    }

    async getToken() {
        if (this.token && Date.now() < this.tokenExpiresAt - 60_000) {
            return this.token;
        }
        const { clientId, clientSecret } = await this.loadCredentials();
        if (!clientId || !clientSecret) {
            throw new Error('Cakto API credentials not configured');
        }
        const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret });
        const res = await axios.post(`${BASE_URL}/public_api/token/`, body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000
        });
        this.token = res.data.access_token;
        this.tokenExpiresAt = Date.now() + (res.data.expires_in || 3600) * 1000;
        return this.token;
    }

    async request(method, path, data = null, params = null) {
        const token = await this.getToken();
        const res = await axios({
            method,
            url: `${BASE_URL}${path}`,
            data: data || undefined,
            params: params || undefined,
            headers: { Authorization: `Bearer ${token}` },
            timeout: 20000
        });
        return res.data;
    }

    async getSubscription(id) {
        return this.request('get', `/public_api/subscriptions/${id}/`);
    }

    async listSubscriptionsByEmail(email) {
        // A listagem aceita filtros por querystring; se o filtro não casar,
        // o chamador ainda pode filtrar pelo e-mail no resultado.
        const data = await this.request('get', '/public_api/subscriptions/', null, { email });
        return data?.results || data || [];
    }

    async updateSubscriptionAmount(id, amount) {
        return this.request('put', `/public_api/subscriptions/${id}/`, {
            amount: Number(amount.toFixed(2))
        });
    }

    async cancelSubscription(id) {
        return this.request('post', `/public_api/subscriptions/${id}/cancel/`);
    }
}

module.exports = new CaktoService();
