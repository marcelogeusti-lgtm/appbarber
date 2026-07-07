const pino = require('pino');

/**
 * Logger estruturado (JSON) da plataforma — Pino.
 *
 * Uso:
 *   const logger = require('../lib/logger');
 *   logger.info({ action: 'payment_approved', paymentId }, 'Pagamento aprovado');
 *   req.log.error({ err, action: 'login_failed' }, 'Falha no login');
 *
 * Convenções:
 * - SEMPRE passe um objeto de contexto com `action` (snake_case) + ids relevantes.
 * - Erros vão na chave `err` (Pino serializa stack/message automaticamente).
 * - Em rotas, prefira `req.log` (já carrega requestId, método, rota e userId).
 * - Níveis: debug < info < warn < error < fatal.
 *   fatal = o processo/fluxo não consegue continuar (ex.: config essencial ausente).
 *
 * Sanitização: os caminhos abaixo são SEMPRE mascarados ("***") — senhas,
 * tokens, chaves de gateway, headers de autorização e dados pessoais
 * sensíveis nunca chegam aos logs, mesmo se passados por engano.
 */

const SENSITIVE_KEYS = [
    'password', 'senha', 'newPassword', 'currentPassword', 'confirmPassword',
    'token', 'accessToken', 'access_token', 'refreshToken', 'mfaToken',
    'secretKey', 'clientSecret', 'apiKey', 'authorization', 'cookie',
    'publicKey', 'credentials', 'cardNumber', 'cvv', 'securityCode',
    'cpf', 'cnpj', 'client_secret', 'twoFactorCode', 'otp'
];

// Cobre a chave no nível raiz, 1 e 2 níveis de profundidade (limite do Pino p/ wildcard)
const redactPaths = SENSITIVE_KEYS.flatMap(k => [k, `*.${k}`, `*.*.${k}`]);

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'next-api', env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development' },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level(label) {
            return { level: label };
        }
    },
    redact: {
        paths: redactPaths,
        censor: '***'
    }
});

// Máscaras utilitárias para dados que PRECISAM aparecer parcialmente
logger.maskEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) return '***';
    const [user, domain] = email.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
};

logger.maskPhone = (phone) => {
    if (!phone) return '***';
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 4 ? `***${digits.slice(-4)}` : '***';
};

module.exports = logger;
