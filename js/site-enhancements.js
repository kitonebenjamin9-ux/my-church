(function(){
  function installPWA(){
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }
    const link=document.createElement('link'); link.rel='manifest'; link.href='/manifest.webmanifest'; document.head.appendChild(link);
    const meta=document.createElement('meta'); meta.name='theme-color'; meta.content='#4b0082'; document.head.appendChild(meta);
  }
  function addSearch(){
    if(document.getElementById('site-search-launcher')) return;
    const a=document.createElement('a'); a.id='site-search-launcher'; a.href='/search.html'; a.className='site-search-launcher'; a.setAttribute('aria-label','Search website'); a.title='Search website'; a.innerHTML='⌕'; document.body.appendChild(a);
  }
  function network(){
    if(document.getElementById('ht-network-status')) return;
    const el=document.createElement('div'); el.id='ht-network-status'; el.setAttribute('role','status'); el.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9999;padding:9px 14px;border-radius:999px;background:#172033;color:#fff;font:600 13px system-ui;display:none;box-shadow:0 8px 30px rgba(0,0,0,.18)'; document.body.appendChild(el);
    const show=msg=>{el.textContent=msg;el.style.display='block';clearTimeout(window.__htNetTimer);window.__htNetTimer=setTimeout(()=>el.style.display='none',3500)};
    window.addEventListener('offline',()=>show('You are offline. Cached content remains available.'));
    window.addEventListener('online',()=>show('Connection restored.'));
  }
  function keyboard(){document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();location.href='/search.html'}})}
  document.addEventListener('DOMContentLoaded',()=>{installPWA();addSearch();network();keyboard();});
})();
