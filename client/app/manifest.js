export default function manifest() {
    return {
        name: 'NEXT - Sistema de Gestão para Barbearias',
        short_name: 'NEXT Barbearia',
        description: 'O sistema de gestão que sua barbearia merece',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            },
        ],
    }
}
