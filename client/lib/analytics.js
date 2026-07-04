// Wrapper around GA4 + Meta Pixel so the rest of the app can fire events
// without caring whether the tracking IDs are configured yet.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function trackEvent(eventName, params = {}) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
        window.gtag('event', eventName, params);
    }

    if (window.fbq) {
        window.fbq('trackCustom', eventName, params);
    }
}
