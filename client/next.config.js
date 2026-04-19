/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    experimental: {},
    // Fix for potential image host issues if you use external images
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: '/api/server/:path*',
            },
        ];
    },
    async redirects() {
        return [
            { source: '/', destination: '/inicio', permanent: true },
            { source: '/home', destination: '/inicio', permanent: true },
            { source: '/search', destination: '/buscar', permanent: true },
            { source: '/agendamentos', destination: '/agenda', permanent: true },
            { source: '/appointments', destination: '/agenda', permanent: true },
            { source: '/favorites', destination: '/favoritos', permanent: true },
            { source: '/profile', destination: '/perfil', permanent: true },
            { source: '/history', destination: '/historico', permanent: true },
            { source: '/cards', destination: '/cartoes', permanent: true },
            { source: '/packages', destination: '/pacotes', permanent: true },
            { source: '/subscriptions', destination: '/assinaturas', permanent: true },
            { source: '/support', destination: '/suporte', permanent: true },
            { source: '/terms', destination: '/termos', permanent: true }
        ];
    },
};

module.exports = nextConfig;
