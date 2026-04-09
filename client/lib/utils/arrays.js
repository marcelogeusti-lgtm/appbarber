/**
 * Safely ensures that the returned value is an array.
 * Handles Axios responses, direct arrays, and wrapped { data: [...] } objects.
 * 
 * @param {any} input - The input to convert to an array
 * @returns {Array} - An array (empty if input is invalid)
 */
export const ensureArray = (input) => {
    if (!input) return [];
    
    // Case 1: Already an array
    if (Array.isArray(input)) return input;
    
    // Case 2: Axios response-like object with .data
    if (input.data && Array.isArray(input.data)) {
        return input.data;
    }
    
    // Case 3: Nested data property { data: { data: [...] } }
    if (input.data && input.data.data && Array.isArray(input.data.data)) {
        return input.data.data;
    }

    // Fallback: If it's an object but we expected an array, log it and return empty
    console.warn('[ensureArray] Expected array but received:', typeof input, input);
    return [];
};
