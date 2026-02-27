importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC0tblT2UN55aJ2vEJSJ2ShbLBB7n4QQuY",
    authDomain: "barberon-ac7f5.firebaseapp.com",
    projectId: "barberon-ac7f5",
    storageBucket: "barberon-ac7f5.firebasestorage.app",
    messagingSenderId: "543382789695",
    appId: "1:543382789695:web:62548830d3c880c87d628a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logos/logo_icon.svg',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
