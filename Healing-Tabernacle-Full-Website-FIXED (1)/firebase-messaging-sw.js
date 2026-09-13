/* Firebase Cloud Messaging service worker.
   Before production push notifications, configure Firebase Messaging + VAPID key in the admin/settings flow. */
self.addEventListener('push', event => {
  let data={}; try { data=event.data?.json()||{}; } catch(e) { data={title:'Healing Tabernacle',body:event.data?.text()||''}; }
  event.waitUntil(self.registration.showNotification(data.title||'Healing Tabernacle Ministries',{body:data.body||'',icon:'assets/logo/favicon.png'}));
});
