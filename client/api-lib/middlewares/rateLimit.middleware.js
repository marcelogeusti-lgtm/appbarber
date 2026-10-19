/**
 * Rate limiting para rotas sensíveis (login, OTP, cadastro, recuperação de senha).
 *
 * Armazenamento:
 *  - Upstash Redis (REST) quando UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *    estão definidos — contador compartilhado entre todas as instâncias serverless.
 *  - Memória do processo como fallback. Na Vercel cada instância tem a sua
 *    memória, então o limite fica por instância: protege contra força bruta
 *    simples, mas configure o Upstash em produção.
 *
 * Se o Redis falhar, cai para memória (fail-open controlado) para não derrubar o login.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memory = new Map(); // key -> { count, resetAt }

function memoryHit(key, windowMs) {
    const now = Date.now();
    let entry = memory.get(key);
    if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + windowMs };
        memory.set(key, entry);
    }
    entry.count += 1;

    // Limpeza preguiçosa para o Map não crescer sem limite
    if (memory.size > 10000) {
        for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
    }
    return { count: entry.count, resetMs: entry.resetAt - now };
}

async function redisHit(key, windowMs) {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
            ['INCR', key],
            ['PEXPIRE', key, String(windowMs), 'NX'],
            ['PTTL', key]
        ]),
        signal: AbortSignal.timeout(1500)
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    const [incr, , pttl] = await res.json();
    if (incr.error) throw new Error(incr.error);
    return { count: Number(incr.result), resetMs: Math.max(Number(pttl.result) || windowMs, 0) };
}

async function hit(key, windowMs) {
    if (UPSTASH_URL && UPSTASH_TOKEN) {
        try {
            return await redisHit(key, windowMs);
        } catch (err) {
            console.warn('[RateLimit] Upstash indisponível, usando memória:', err.message);
        }
    }
    return memoryHit(key, windowMs);
}

// Na Vercel, x-real-ip / x-forwarded-for são definidos pela borda.
function clientIp(req) {
    return req.headers['x-real-ip']
        || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
        || req.ip
        || req.socket?.remoteAddress
        || 'unknown';
}

const byIp = (req) => clientIp(req);
const byEmail = (req) => {
    const email = req.body?.email;
    return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
};
const byUser = (req) => req.user?.authUserId || req.user?.id || null;

/**
 * @param {object} opts
 * @param {string} opts.name      Prefixo da chave (ex.: 'login-ip')
 * @param {number} opts.max       Requisições permitidas na janela
 * @param {number} opts.windowMs  Tamanho da janela em ms
 * @param {(req) => string|null} opts.key  Extrai o identificador; null = não limita
 */
function rateLimit({ name, max, windowMs, key = byIp, message }) {
    return async (req, res, next) => {
        const id = key(req);
        if (!id) return next();

        try {
            const { count, resetMs } = await hit(`rl:${name}:${id}`, windowMs);
            if (count > max) {
                const retryAfter = Math.ceil(resetMs / 1000);
                res.setHeader('Retry-After', String(retryAfter));
                (req.log || console).warn?.({ rateLimit: name, ip: clientIp(req) }, 'Rate limit excedido');
                return res.status(429).json({
                    message: message || `Muitas tentativas. Tente novamente em ${Math.ceil(retryAfter / 60)} minuto(s).`,
                    retryAfter
                });
            }
        } catch (err) {
            console.error('[RateLimit] Erro inesperado:', err.message);
        }
        next();
    };
}

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// Limites por rota. Por IP segura varredura de várias contas; por e-mail
// segura força bruta numa conta só (inclui o código 2FA, que chega via /login).
const authLimits = {
    login: [
        rateLimit({ name: 'login-ip', max: 30, windowMs: 15 * MIN }),
        rateLimit({ name: 'login-email', max: 10, windowMs: 15 * MIN, key: byEmail })
    ],
    socialLogin: [
        rateLimit({ name: 'social-ip', max: 30, windowMs: 15 * MIN })
    ],
    register: [
        rateLimit({ name: 'register-ip', max: 10, windowMs: HOUR })
    ],
    forgotPassword: [
        rateLimit({ name: 'forgot-ip', max: 10, windowMs: HOUR }),
        rateLimit({ name: 'forgot-email', max: 3, windowMs: HOUR, key: byEmail })
    ],
    resetPassword: [
        rateLimit({ name: 'reset-ip', max: 10, windowMs: 15 * MIN })
    ],
    // Rotas autenticadas de 2FA: por usuário (rodar depois do protect)
    otpSend: [
        rateLimit({ name: 'otp-send-user', max: 5, windowMs: 15 * MIN, key: byUser })
    ],
    otpVerify: [
        rateLimit({ name: 'otp-verify-user', max: 10, windowMs: 15 * MIN, key: byUser })
    ]
};

module.exports = { rateLimit, authLimits, clientIp };
