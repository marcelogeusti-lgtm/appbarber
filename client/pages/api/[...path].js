const app = require('../../api-lib/app');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
    // Vercel/Next.js might strip /api from the URL in pages/api
    // But Express is expecting /api/... in our app.js
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + req.url;
    }
    
    console.log('[DEBUG] Unified API Request:', req.method, req.url);
    
    return app(req, res);
}
