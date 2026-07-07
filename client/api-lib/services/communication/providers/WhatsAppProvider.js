const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const socket = require('../../../socket'); // Check relative path correctness
const eventBus = require('../../events/eventBus'); // Use absolute/relative path as needed (it's in server/src/services/events/eventBus.js)

class WhatsAppProvider {
    constructor() {
        this.sock = null;
        this.qrCode = null;
        this.status = 'DISCONNECTED';
        this.authDir = path.resolve(__dirname, '../../../../auth_info_baileys');

        // Do NOT run Baileys in production — it requires QR scan + persistent filesystem.
        // In production, WhatsApp is handled via Evolution API (external service).
        if (process.env.NODE_ENV === 'production') {
            console.log('[WhatsAppProvider] Production environment detected. Baileys disabled. Use Evolution API for WhatsApp.');
            return;
        }

        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }

        this.initialize();
    }

    async initialize() {
        try {
            const { makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
            const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

            this.sock = makeWASocket({
                printQRInTerminal: true,
                auth: state,
                browser: ['AppBarber Cloud', 'Chrome', '1.0.0'],
                defaultQueryTimeoutMs: undefined // Keep connection alive
            });

            this.sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;

                // Create helper to safely emit
                const safeEmit = (event, data) => {
                    try {
                        socket.getIO().emit(event, data);
                    } catch (e) { /* Socket not ready yet */ }
                };

                if (qr) {
                    this.qrCode = qr;
                    this.status = 'WAITING_QR';
                    console.log('QRCode generated');
                    safeEmit('whatsapp_status', { status: 'WAITING_QR', qr });
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
                    if (shouldReconnect) {
                        this.initialize();
                    } else {
                        // Logged out
                        this.status = 'DISCONNECTED';
                        safeEmit('whatsapp_status', { status: 'DISCONNECTED' });
                    }
                } else if (connection === 'open') {
                    console.log('WhatsApp connection opened');
                    this.status = 'CONNECTED';
                    this.qrCode = null;
                    safeEmit('whatsapp_status', { status: 'CONNECTED' });
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

            // Listen for messages (Auto-Reply Logic)
            this.sock.ev.on('messages.upsert', async m => {
                const msg = m.messages[0];

                // 1. Basic Filter: Ignore self-sent and non-notify types
                if (msg.key.fromMe || m.type !== 'notify') return;

                const from = msg.key.remoteJid;

                // 2. BLOCK GROUPS (Strict Rule)
                // Ignore if it's a broadcast or group
                if (from.endsWith('@g.us') || from === 'status@broadcast') {
                    // console.log(`Ignoring Group/Broadcast message from ${from}`);
                    return;
                }

                // 3. Extract Message Content
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                if (!text) return; // Ignore media updates without text for now or empty messages

                const name = msg.pushName || 'Desconhecido';
                console.log(`New Private Message from ${name} (${from}): ${text}`);

                // 4. Validate Sender (Must be a Client or have active context)
                // We need to require Prisma inside here or pass it? 
                // Better: Emit event ONLY if valid? Or let the listener validate?
                // Request says: "O sistema SÓ PODE aceitar mensagens de números que estejam cadastrados"
                // Implementing strict check here requires DB access.

                // Let's emit to Socket only if valid.
                // However, 'socket' module usage here is valid.
                // But filtering logic needs DB. 
                // To avoid circular deps/complexity in Provider, we should emit "whatsapp_message_received" 
                // and let the Service handle the DB check and decide to process or drop.

                // Update: User said "WhatsApp NÃO DEVE importar...". 
                // If we check DB here, we need Prisma.

                try {
                    // Safe Emit to Server Logic
                    const eventPayload = {
                        id: msg.key.id,
                        from,
                        name,
                        text,
                        timestamp: new Date()
                    };

                    socket.getIO().emit('whatsapp_message_received', eventPayload);

                    // Also emit to internal event bus for the Smart Bot
                    eventBus.emit('WHATSAPP_MESSAGE_RECEIVED', eventPayload);
                } catch (e) {
                    require('../../../lib/logger').warn(
                        { err: e, action: 'whatsapp_inbound_dispatch_failed' },
                        'Falha ao repassar mensagem recebida do WhatsApp'
                    );
                }
            });

        } catch (error) {
            console.error('Error init WhatsApp:', error);
            this.status = 'ERROR';
        }
    }

    async getStatus() {
        // Return status and QR as Data URL if waiting
        if (this.status === 'WAITING_QR' && this.qrCode) {
            const qrDataUrl = await qrcode.toDataURL(this.qrCode);
            return { status: this.status, qr: qrDataUrl };
        }
        return { status: this.status };
    }

    async sendText(to, text) {
        if (this.status !== 'CONNECTED' || !this.sock) {
            throw new Error('WhatsApp not connected');
        }
        // Format number: ensure it has @s.whatsapp.net
        // If number comes as '55119999999', adding suffix.
        const id = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

        await this.sock.sendMessage(id, { text });
        return true;
    }
}

// Singleton instance
const whatsAppProvider = new WhatsAppProvider();
module.exports = whatsAppProvider;
