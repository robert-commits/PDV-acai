const APP_NAME='Açaí Obrigatório · PDV';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?event.data.json():{};}catch(e){payload={body:event.data?event.data.text():'Você tem uma atualização no PDV.'};}
 const title=payload.title||APP_NAME;
 const options={body:payload.body||'Há uma nova atualização no Açaí Obrigatório.',icon:'./icon-192.png',badge:'./icon-192.png',tag:payload.tag||'acai-obrigatorio-push',renotify:true,data:{url:payload.url||'./',...(payload.data||{})}};
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const target=event.notification.data&&event.notification.data.url?event.notification.data.url:'./';
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list){if('focus' in client){client.navigate(target);return client.focus();}}if(self.clients.openWindow)return self.clients.openWindow(target);}));
});
