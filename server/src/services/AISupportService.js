const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AISupportService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.knowledgePath = path.join(__dirname, '../data/ai_knowledge.json');
        this.knowledgeBase = null;
        this.loadKnowledge();
    }

    loadKnowledge() {
        try {
            const data = fs.readFileSync(this.knowledgePath, 'utf8');
            this.knowledgeBase = JSON.parse(data);
        } catch (error) {
            console.error('Error loading AI Knowledge Base:', error);
            this.knowledgeBase = { modules: {}, fallbacks: { unknown: 'Erro ao carregar base de conhecimento.' } };
        }
    }

    async getChatResponse(message) {
        // Se não houver chave de API, vamos tentar um "matcher" simples local apenas para demonstrar
        if (!this.apiKey) {
            return this.getLocalResponse(message);
        }

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: this.buildSystemPrompt(message)
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                }
            );

            const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            return aiText || this.knowledgeBase.fallbacks.unknown;
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            // Fallback para matcher local em caso de erro na API externa
            return this.getLocalResponse(message);
        }
    }

    buildSystemPrompt(userQuestion) {
        const knowledgeStr = JSON.stringify(this.knowledgeBase.modules, null, 2);
        
        return `
Você é o Assistente Inteligente do AppBarber, um sistema de gestão para barbearias.
Sua missão é ajudar os usuários (donos de barbearia e profissionais) a usarem o sistema.

DIRETRIZES:
1. Responda de forma humana, direta e amigável.
2. Use APENAS o conhecimento fornecido abaixo sobre o sistema.
3. Se o usuário perguntar algo que não está no guia abaixo, responda educadamente que ainda não sabe sobre isso e sugira falar com um humano.
4. NUNCA invente funcionalidades que não estão listadas.
5. Se a resposta envolver passos, use marcadores para facilitar a leitura.

BASE DE CONHECIMENTO DO SISTEMA:
${knowledgeStr}

PERGUNTA DO USUÁRIO:
"${userQuestion}"

RESPOSTA (Em Português do Brasil):`;
    }

    /**
     * Fallback local usando busca simples por palavras-chave
     * Útil quando a API Key não está configurada ou falha.
     */
    getLocalResponse(message) {
        const msg = message.toLowerCase();
        let bestMatch = null;

        // Procura por palavras-chave nos fluxos
        for (const modKey in this.knowledgeBase.modules) {
            const module = this.knowledgeBase.modules[modKey];
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

        return this.knowledgeBase.fallbacks.unknown;
    }
}

module.exports = new AISupportService();
