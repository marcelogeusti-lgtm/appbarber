const axios = require('axios');

/**
 * Geocodes an address string into latitude and longitude using OpenStreetMap Nominatim.
 * @param {string} address The full address string.
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodeAddress(address) {
    if (!address || address.trim().length < 5) return null;

    try {
        console.log(`[GEOCODER] Geocoding: ${address}`);
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'AppBarberSaaS/1.0 (Contact: support@appbarber.com.br)'
            },
            timeout: 5000
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            };
        }
        
        console.warn(`[GEOCODER] No results found for: ${address}`);
        return null;
    } catch (error) {
        console.error('[GEOCODER] Error:', error.message);
        return null;
    }
}

module.exports = { geocodeAddress };
