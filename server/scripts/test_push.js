const { messaging } = require('../src/config/firebaseAdmin');

async function testPush() {
    console.log('--- Testing Firebase Push Notification ---');

    // Replace with a real token from your DB after registering a device
    const testToken = process.argv[2];

    if (!testToken) {
        console.error('Please provide a token: node test_push.js <FCM_TOKEN>');
        process.exit(1);
    }

    if (!messaging) {
        console.error('Firebase messaging not initialized. Check your credentials.');
        process.exit(1);
    }

    const message = {
        notification: {
            title: '🚀 Teste de Notificação',
            body: 'Seu sistema AppBarber está pronto para enviar notificações push!'
        },
        data: {
            url: '/dashboard'
        },
        token: testToken
    };

    try {
        const response = await messaging.send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

testPush();
