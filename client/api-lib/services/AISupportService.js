const axios = require('axios');
const prisma = require('../lib/prisma');
// módulo .js (não .json): o .vercelignore do projeto descarta *.json do deploy
const knowledgeBase = require('../data/ai_knowledge');

const PROVIDERS = {
    gemini: {
        label: 'Google Gemini',
        model: 'gemini-2.0-flash'
    },
    openai: {
        label: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini'
    },
    grok: {
        label: 'xAI Grok',
        baseUrl: 'https://api.x.ai/v1',
        model: 'grok-3-mini'
    }
};

/**
 * Assistente do chat de suporte do dashboard.
 * Provedor e chave configurados no painel Master (PlatformSetting:
 * AI_PROVIDER = gemini | openai | grok, AI_API_KEY). Sem chave → matcher
 * local por palavra-chave sobre a base de conhecimento.
 */
class AISupportService {
    constructor() {
        this.config = null;
        this.configLoadedAt = 0;
    }

    async loadConfig(force = false) {
        if (!force && this.config && Date.now() - this.configLoadedAt < 60_000) {
            return this.config;
        }
        const rows = await prisma.platformSetting.findMany({
            where: { key: { in: ['AI_PROVIDER', 'AI_API_KEY'] } }
        });
        const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
        this.config = {
            provider: (map.AI_PROVIDER || '').toLowerCase(),
            apiKey: map.AI_API_KEY || process.env.GEMINI_API_KEY || null
        };
        this.configLoadedAt = Date.now();
        return this.config;
    }

    refreshConfig() {
        this.config = null;
        this.configLoadedAt = 0;
    }

    async getChatResponse(message) {
        const { provider, apiKey } = await this.loadConfig();

        if (!apiKey || !PROVIDERS[provider]) {
            return this.getLocalResponse(message);
        }

        try {
            if (provider === 'gemini') {
                return await this.askGemini(message, apiKey);
            }
            // OpenAI e Grok compartilham o mesmo formato de API
            return await this.askOpenAICompatible(message, apiKey, PROVIDERS[provider]);
        } catch (error) {
            console.error(`[AISupport] ${provider} API error:`, error.response?.data || error.message);
            return this.getLocalResponse(message);
        }
    }

    // Chamada "crua" ao provedor configurado (sem a base de conhecimento do suporte).
    // Usada pela análise de negócio; retorna null se não houver chave configurada.
    async generateText(prompt) {
        const { provider, apiKey } = await this.loadConfig();
        if (!apiKey || !PROVIDERS[provider]) return null;

        try {
            if (provider === 'gemini') {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${apiKey}`,
                    {
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.4, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
                    },
                    { timeout: 30000 }
                );
                return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
            }
            const cfg = PROVIDERS[provider];
            const response = await axios.post(
                `${cfg.baseUrl}/chat/completions`,
                {
                    model: cfg.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.4,
                    max_tokens: 1024
                },
                { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 }
            );
            return response.data?.choices?.[0]?.message?.content || null;
        } catch (error) {
            console.error(`[AISupport] generateText ${provider} error:`, error.response?.data || error.message);
            return null;
        }
    }

    async askGemini(message, apiKey) {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: this.buildSystemPrompt(message) }] }],
                generationConfig: { temperature: 0.2, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
            },
            { timeout: 30000 }
        );
        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return aiText || knowledgeBase.fallbacks.unknown;
    }

    async askOpenAICompatible(message, apiKey, providerCfg) {
        const response = await axios.post(
            `${providerCfg.baseUrl}/chat/completions`,
            {
                model: providerCfg.model,
                messages: [
                    { role: 'system', content: this.buildSystemPrompt() },
                    { role: 'user', content: message }
                ],
                temperature: 0.2,
                max_tokens: 1024
            },
            {
                headers: { Authorization: `Bearer ${apiKey}` },
                timeout: 30000
            }
        );
        const aiText = response.data?.choices?.[0]?.message?.content;
        return aiText || knowledgeBase.fallbacks.unknown;
    }

    buildSystemPrompt(userQuestion) {
        const knowledgeStr = JSON.stringify(knowledgeBase.modules, null, 2);
        const questionBlock = userQuestion
            ? `\nPERGUNTA DO USUÁRIO:\n"${userQuestion}"\n\nRESPOSTA (Em Português do Brasil):`
            : '';

        return `
Você é o Assistente Inteligente do NEXT (corteconexao.com.br), um sistema de gestão para barbearias.
Sua missão é ajudar os usuários (donos de barbearia e profissionais) a usarem o sistema.

DIRETRIZES:
1. Responda de forma humana, direta e amigável, em Português do Brasil.
2. Use APENAS o conhecimento fornecido abaixo sobre o sistema.
3. Se o usuário perguntar algo que não está no guia abaixo, responda educadamente que ainda não sabe sobre isso e sugira falar com um humano.
4. NUNCA invente funcionalidades que não estão listadas.
5. Se a resposta envolver passos, use marcadores para facilitar a leitura.

BASE DE CONHECIMENTO DO SISTEMA:
${knowledgeStr}
${questionBlock}`;
    }

    // Fallback local por palavra-chave quando não há chave de IA configurada
    getLocalResponse(message) {
        const msg = message.toLowerCase();
        let bestMatch = null;

        for (const modKey in knowledgeBase.modules) {
            const module = knowledgeBase.modules[modKey];
            for (const flow of module.flows) {
                if (msg.includes(flow.intent.toLowerCase().replace('como ', '').replace('?', '').trim())) {
                    bestMatch = flow;
                    break;
                }
            }
            if (bestMatch) break;
        }

        if (bestMatch) {
            return `Vou te ajudar com isso! 👇\n\n${bestMatch.steps.map(s => `• ${s}`).join('\n')}\n\nEspero que ajude! Posso auxiliar em mais algo?`;
        }

        return knowledgeBase.fallbacks.unknown;
    }
}

module.exports = new AISupportService();
