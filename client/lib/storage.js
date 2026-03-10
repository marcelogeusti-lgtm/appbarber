/**
 * Utility for safe localStorage access.
 * Handles QuotaExceededError and private browsing restrictions.
 */

export const safeSetItem = (key, value) => {
    try {
        if (typeof window === 'undefined') return false;

        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        window.localStorage.setItem(key, stringValue);
        return true;
    } catch (error) {
        console.error(`[Storage] Failed to save ${key}:`, error);

        // Check for QuotaExceededError (different browsers use different names)
        const isQuotaError =
            error instanceof DOMException && (
                // everything except Firefox
                error.code === 22 ||
                // Firefox
                error.code === 1014 ||
                // test name field too, because code might not be present
                error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            );

        if (isQuotaError) {
            // Throw a user-friendly error in Portuguese
            throw new Error('Seu navegador está sem espaço ou em modo privado. Por favor, limpe o cache ou saia do modo anônimo para continuar.');
        }

        // Re-throw other errors
        throw error;
    }
};

export const safeGetItem = (key, parse = false) => {
    try {
        if (typeof window === 'undefined') return null;

        const value = window.localStorage.getItem(key);
        if (!value) return null;

        return parse ? JSON.parse(value) : value;
    } catch (error) {
        console.error(`[Storage] Failed to read ${key}:`, error);
        return null;
    }
};

export const safeRemoveItem = (key) => {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
    } catch (error) {
        console.error(`[Storage] Failed to remove ${key}:`, error);
    }
};
