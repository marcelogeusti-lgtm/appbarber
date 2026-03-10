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

        // Comprehensive check for QuotaExceededError
        const errorMessage = (error.message || '').toLowerCase();
        const errorName = (error.name || '');

        const isQuotaError =
            errorName === 'QuotaExceededError' ||
            errorName === 'NS_ERROR_DOM_QUOTA_REACHED' ||
            error.code === 22 ||
            error.code === 1014 ||
            errorMessage.includes('quota') ||
            errorMessage.includes('exceeded') ||
            errorMessage.includes('limit');

        if (isQuotaError) {
            // Friendly message for the UI
            const friendlyMessage = 'Seu navegador está sem espaço ou em modo privado. Por favor, limpe o cache ou saia do modo anônimo para continuar.';
            // We throw a standardized error so the UI can catch it consistently
            const quotaError = new Error(friendlyMessage);
            quotaError.name = 'QuotaExceededError';
            throw quotaError;
        }

        // For other errors, we just return false to avoid crashing the whole app
        return false;
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

export const safeClear = () => {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage.clear();
    } catch (error) {
        console.error(`[Storage] Failed to clear storage:`, error);
    }
};
