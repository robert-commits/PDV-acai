/* Firebase Cloud Messaging compatível com o service worker original do PDV. */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: 'AIzaSyALq-iZ7Su1ddpg9TcVYYAfMSZ9KhkMPfc',
  authDomain: 'acaiobrigatorio-9ae3f.firebaseapp.com',
  projectId: 'acaiobrigatorio-9ae3f',
  storageBucket: 'acaiobrigatorio-9ae3f.firebasestorage.app',
  messagingSenderId: '684376458043',
  appId: '1:684376458043:web:895bfa749ad19dd95f2d1e'
});
const firebaseMessaging = firebase.messaging();
const APP_NAME='Açaí Obrigatório · PDV';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?event.data.json():{};}catch(e){payload={body:event.data?event.data.text():'Você tem uma atualização no PDV.'};}
 if(payload.notification) return; // Firebase exibe automaticamente payloads com notification.
 const title=payload.title||(payload.data&&payload.data.title)||APP_NAME;
 const options={body:payload.body||(payload.data&&payload.data.body)||'Há uma nova atualização no Açaí Obrigatório.',icon:'./icon-192.png',badge:'./icon-192.png',tag:payload.tag||'acai-obrigatorio-push',renotify:true,data:{url:payload.url||'./',...(payload.data||{})}};
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const target=event.notification.data&&event.notification.data.url?event.notification.data.url:'./';
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list){if('focus' in client){client.navigate(target);return client.focus();}}if(self.clients.openWindow)return self.clients.openWindow(target);}));
});
