/* Sermon library: search + speaker + series + date + related sermons + sharing. */
document.addEventListener('DOMContentLoaded', () => {
 const q=document.getElementById('sermon-search'), speaker=document.getElementById('sermon-preacher'), series=document.getElementById('sermon-series')||document.getElementById('sermon-topic'), date=document.getElementById('sermon-date');
 const cards=[...document.querySelectorAll('#sermon-grid > .card')], empty=document.getElementById('sermon-empty');
 function apply(){let n=0, term=(q?.value||'').toLowerCase(), sp=speaker?.value||'all', se=series?.value||'all', dt=date?.value||'';
  cards.forEach(c=>{let ok=(!term||(`${c.dataset.title||''} ${c.textContent}`).toLowerCase().includes(term))&&(sp==='all'||c.dataset.preacher===sp)&&(se==='all'||(c.dataset.series||c.dataset.topic)===se)&&(!dt||(c.dataset.date||'').startsWith(dt)); c.hidden=!ok;n+=ok;}); if(empty) empty.hidden=n>0; }
 [q,speaker,series,date].filter(Boolean).forEach(x=>x.addEventListener(x===q?'input':'change',apply));
 document.querySelectorAll('.sermon-share').forEach(b=>b.addEventListener('click',async()=>{let title=b.dataset.shareTitle||document.title;if(navigator.share) try{await navigator.share({title,url:location.href});}catch{}else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);b.textContent='Link Copied!';setTimeout(()=>b.textContent='Share',1600);}}));
 document.querySelectorAll('[data-related-sermons]').forEach(host=>{const current=host.dataset.currentSeries||''; const related=cards.filter(c=>(c.dataset.series||c.dataset.topic)===current).slice(0,3); host.innerHTML=related.length?related.map(c=>c.outerHTML).join(''):'<p>No related sermons available yet.</p>';});
});
