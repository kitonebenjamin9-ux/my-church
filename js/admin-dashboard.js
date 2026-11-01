import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { db } from './firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const modules=[
  ['Overview','admin.html','📊','Quick view of ministry activity and important items'],
  ['Content Manager','admin-platform.html','🗂️','Manage website content from one central place'],
  ['Secure Messages & Records','admin-secure.html','🔐','Open contact messages, prayer requests, registrations, members and ministry records after password verification'],
  ['Branches','admin-branches.html','⛪','Manage church branches and branch information'],
  ['Website Settings','admin-settings.html','⚙️','Control church identity, links and public settings'],
  ['Updates','admin-updates.html','📣','Publish announcements and important updates'],
];

onAuthStateChanged(auth,async u=>{
  if(!u){location.href='admin-login.html';return;}
  try {
    const p=await getDoc(doc(db,'users',u.uid));
    const role=String(p.data()?.role||'').trim().toLowerCase();
    if(!p.exists()){
      document.getElementById('admin-status').textContent='Admin profile missing. Create users/'+u.uid+' in Firestore with role admin or pastor.';
      return;
    }
    if(!['admin','pastor'].includes(role)){
      document.getElementById('admin-status').textContent='Wrong role in users/'+u.uid+'. Set role to admin or pastor.';
      return;
    }
    document.getElementById('admin-status').textContent=`Signed in as ${p.data()?.name||u.email}`;
    document.getElementById('admin-modules').innerHTML=modules.map(([name,href,icon,desc])=>
    `<a class="card admin-module" href="${href}">
      <span class="admin-module-icon" aria-hidden="true">${icon}</span>
      <h3>${name}</h3><p>${desc}</p>
      <span class="admin-module-open">Open module →</span>
    </a>`).join('');
  } catch (e) { console.error(e); document.getElementById('admin-status').textContent='Could not verify administrator access.'; }
});
