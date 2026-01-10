const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const socket = require('../../../socket'); // Check relative path correctness

class WhatsAppProvider {
    constructor() {
        this.sock = null;
        this.qrCode = null;
        this.status = 'DISCONNECTED';
        this.authDir = path.resolve(__dirname, '../../../../auth_info_baileys');

        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }

        this.initialize();
    }

    async initialize() {
        try {
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
                if (!msg.key.fromMe && m.type === 'notify') {
                    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                    const from = msg.key.remoteJid;
                    const name = msg.pushName || 'Desconhecido';

                    console.log(`New Message from ${name}: ${text}`);

                    try {
                        socket.getIO().emit('whatsapp_message', {
                            id: msg.key.id,
                            from,
                            name,
                            text,
                            timestamp: new Date()
                        });
                    } catch (e) { }

                    // Here we can also call your centralized "handleIncomingMessage" service
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
