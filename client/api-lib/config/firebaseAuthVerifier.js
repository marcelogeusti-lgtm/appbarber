const admin = require('firebase-admin');

/**
 * Verificação de ID tokens do Firebase Auth (login social).
 *
 * Usa um app nomeado só com o projectId: verifyIdToken checa assinatura,
 * emissor, audiência e validade com as chaves públicas do Google, então não
 * depende da conta de serviço (FIREBASE_SERVICE_ACCOUNT_JSON) estar configurada.
 */
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID
    || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    || 'barberon-ac7f5';

const APP_NAME = 'auth-verifier';

function getVerifierApp() {
    const existing = admin.apps.find(a => a && a.name === APP_NAME);
    return existing || admin.initializeApp({ projectId: PROJECT_ID }, APP_NAME);
}

// Provedores aceitos no login social. Tokens anônimos (ensureFirebaseAuth)
// ou de e-mail/senha do Firebase NÃO servem para entrar no AppBarber.
const PROVIDERS = {
    'google.com': 'GOOGLE',
    'facebook.com': 'FACEBOOK'
};

class SocialTokenError extends Error {}

/**
 * Valida o ID token e devolve a identidade confiável extraída dele.
 * @returns {{ uid, email, emailVerified, provider, name, picture }}
 */
async function verifySocialIdToken(idToken) {
    if (!idToken || typeof idToken !== 'string') {
        throw new SocialTokenError('Token de autenticação ausente.');
    }

    let decoded;
    try {
        decoded = await admin.auth(getVerifierApp()).verifyIdToken(idToken);
    } catch (err) {
        throw new SocialTokenError('Token de autenticação inválido ou expirado.');
    }

    const provider = PROVIDERS[decoded.firebase?.sign_in_provider];
    if (!provider) {
        throw new SocialTokenError('Provedor de login não suportado.');
    }

    return {
        uid: decoded.uid,
        email: decoded.email ? decoded.email.toLowerCase() : null,
        emailVerified: decoded.email_verified === true,
        provider,
        name: decoded.name || null,
        picture: decoded.picture || null
    };
}

module.exports = { verifySocialIdToken, SocialTokenError };
