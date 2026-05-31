require('dotenv').config();
const emailService = require('./src/services/notificationService/EmailService');

async function testEmail() {
    try {
        console.log("Testing Resend API Key:", process.env.RESEND_API_KEY);
        const result = await emailService.sendTemplateEmail({
            to: 'waniely2357@gmail.com', // fallback test
            subject: 'Teste de 2FA - Diagnóstico',
            template: 'auth-otp',
            data: {
                otp: '123456',
                logoUrl: 'https://corteconexao.com.br/logos/logo_full.png'
            }
        });
        console.log("Result:", result);
    } catch (e) {
        console.error("Test failed:", e);
    }
}
testEmail();
