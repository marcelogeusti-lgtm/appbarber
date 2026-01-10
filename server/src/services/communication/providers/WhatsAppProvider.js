const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');

class WhatsAppProvider {
    constructor() {
        this.sock = null;
        this.qrCode = null;
        this.status = 'DISCONNECTED';
        this.authDir = path.resolve(__dirname, '../../../../baileys_auth'); // Store auth outside src

        if (!fs.existsSync(this.authDir)) {
            fs.mkdirSync(this.authDir, { recursive: true });
        }

        this.initialize();
    }

    async initialize() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

            this.sock = makeWASocket({
                printQRInTerminal: true, // For debugging logs
                auth: state,
                browser: ['AppBarber Cloud', 'Chrome', '1.0.0']
            });

            this.sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qrCode = qr;
                    this.status = 'WAITING_QR';
                    console.log('QRCode generated');
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
                    if (shouldReconnect) {
                        this.initialize();
                    } else {
                        // Logged out
                        this.status = 'DISCONNECTED';
                        // Clean Auth folder? Maybe manually.
                    }
                } else if (connection === 'open') {
                    console.log('WhatsApp connection opened');
                    this.status = 'CONNECTED';
                    this.qrCode = null;
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

            // Listen for messages (Auto-Reply Logic)
            this.sock.ev.on('messages.upsert', async m => {
                // Logic handled by Service layer usually, but simple reply check here
                const msg = m.messages[0];
                if (!msg.key.fromMe && m.type === 'notify') {
                    // Emit event or handle callback
                    // For now, just log
                    console.log('New Message:', msg.message?.conversation || msg.message?.extendedTextMessage?.text);
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
