/* Firebase Cloud Messaging service worker - Açaí Obrigatório */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
firebase.initializeApp({"apiKey": "AIzaSyALq-iZ7Su1ddpg9TcVYYAfMSZ9KhkMPfc", "authDomain": "acaiobrigatorio-9ae3f.firebaseapp.com", "projectId": "acaiobrigatorio-9ae3f", "storageBucket": "acaiobrigatorio-9ae3f.firebasestorage.app", "messagingSenderId": "684376458043", "appId": "1:684376458043:web:895bfa749ad19dd95f2d1e"});
const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'Açaí Obrigatório';
  const options = { body: payload.notification?.body || 'Você recebeu uma atualização do PDV.', icon: './icon-192.svg', badge: './icon-192.svg', data: payload.data || {} };
  self.registration.showNotification(title, options);
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) if ('focus' in client) return client.focus();
    return clients.openWindow('./');
  }));
});
