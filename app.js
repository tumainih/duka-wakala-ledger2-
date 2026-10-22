/* ==========================================================
   Duka & Wakala Ledger — app.js
   ========================================================== */
const STORE_KEY = 'duka_wakala_ledger_v2';
const CHANNELS = ['Airtel Money', 'M-Pesa', 'Mixx by Yas', 'HaloPesa'];
const CATEGORIES = ['Uuzaji', 'Manunuzi', 'Matumizi', 'Wakala', 'Deni', 'Nyingine'];
const money = n => new Intl.NumberFormat('sw-TZ', {style:'currency',currency:'TZS',maximumFractionDigits:0}).format(Number(n)||0);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const todayKey = () => new Date().toISOString().slice(0,10);

function loadData(){
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {entries:[], cash:0, balances:{}}; }
  catch { return {entries:[], cash:0, balances:{}}; }
}
let data = loadData();
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(data)); render(); }

function balanceFor(channel){ return Number(data.balances[channel]||0); }
function totals(){
  const today = data.entries.filter(e=>e.date===todayKey());
  const income = today.filter(e=>e.kind==='income').reduce((s,e)=>s+e.amount,0);
  const expense = today.filter(e=>e.kind==='expense').reduce((s,e)=>s+e.amount,0);
  const agentIn = today.filter(e=>e.kind==='agent-in').reduce((s,e)=>s+e.amount,0);
  const agentOut = today.filter(e=>e.kind==='agent-out').reduce((s,e)=>s+e.amount,0);
  return {income,expense,agentIn,agentOut,profit:income-expense};
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function addEntry(entry){ data.entries.unshift({id:uid(),date:todayKey(),createdAt:new Date().toISOString(),...entry}); save(); }

function render(){
  const t=totals();
  const recent=data.entries.slice(0,30);
  document.getElementById('app').innerHTML=`
  <header class="topbar"><div class="brand"><div class="brand-mark">D</div><div><div class="brand-title">Duka <span>&</span> Wakala</div><div class="brand-sub">LEDGER · TSH</div></div></div><button id="installBtn" class="install-btn" type="button">Install app</button><div class="top-date">${new Date().toLocaleDateString('sw-TZ',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div></header>
  <main class="shell">
    <section class="welcome"><div><div class="eyebrow">MUHTASARI WA LEO</div><h1>Karibu dukani</h1><p>Rekodi mauzo, matumizi na miamala ya wakala.</p></div><div class="welcome-icon">✦</div></section>
    <section class="stats">
      <article class="stat-card income"><span class="stat-icon">↗</span><span class="stat-label">Mauzo ya leo</span><strong>${money(t.income)}</strong></article>
      <article class="stat-card expense"><span class="stat-icon">↘</span><span class="stat-label">Matumizi ya leo</span><strong>${money(t.expense)}</strong></article>
      <article class="stat-card profit"><span class="stat-icon">◈</span><span class="stat-label">Faida ya leo</span><strong>${money(t.profit)}</strong></article>
      <article class="stat-card agent"><span class="stat-icon">⇄</span><span class="stat-label">Wakala · cash-in</span><strong>${money(t.agentIn)}</strong></article>
    </section>
    <div class="content-grid">
      <section class="panel form-panel"><div class="panel-head"><div><div class="eyebrow">INGIZO JIPYA</div><h2>Rekodi muamala</h2></div><span class="panel-symbol">＋</span></div>
        <form id="entryForm" class="entry-form">
          <label>Aina ya muamala<select name="kind" id="kind"><option value="income">Mauzo</option><option value="expense">Matumizi</option><option value="agent-in">Wakala · Mteja anaweka</option><option value="agent-out">Wakala · Mteja anatoa</option></select></label>
          <label>Kiasi (TZS)<div class="amount-input"><span>TSh</span><input name="amount" type="number" min="1" step="1" placeholder="0" required /></div></label>
          <label>Kategoria<select name="category">${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label>
          <label id="channelWrap" class="hidden">Mtandao<select name="channel">${CHANNELS.map(c=>`<option>${c}</option>`).join('')}</select></label>
          <label>Maelezo<input name="note" type="text" maxlength="100" placeholder="Mfano: Sukari kilo 2" /></label>
          <button class="primary-btn" type="submit">Hifadhi muamala <span>→</span></button>
        </form>
      </section>
      <section class="panel balances-panel"><div class="panel-head"><div><div class="eyebrow">SALIO LA MITANDAO</div><h2>Fedha za wakala</h2></div><span class="panel-symbol">◉</span></div><div class="balance-list">${CHANNELS.map((c,i)=>`<div class="balance-row"><span class="channel-dot dot-${i}"></span><span class="channel-name">${c}</span><strong>${money(balanceFor(c))}</strong></div>`).join('')}</div><button class="secondary-btn" id="balanceBtn">Sasisha salio</button><div class="offline-note"><span class="online-dot"></span> Data inahifadhiwa kwenye kifaa hiki</div></section>
    </div>
    <section class="panel history-panel"><div class="panel-head history-head"><div><div class="eyebrow">SHUGHULI ZA KARIBUNI</div><h2>Daftari la miamala</h2></div><span class="entry-count">${data.entries.length} jumla</span></div>
      <div class="table-wrap">${recent.length?`<table><thead><tr><th>MUAMALA</th><th>KATEGORIA</th><th>TAREHE</th><th class="right">KIASI</th><th></th></tr></thead><tbody>${recent.map(e=>`<tr><td><div class="transaction-title">${escapeHtml(e.note||labelFor(e.kind))}</div><div class="transaction-sub">${labelFor(e.kind)}${e.channel?` · ${escapeHtml(e.channel)}`:''}</div></td><td><span class="category-pill">${escapeHtml(e.category)}</span></td><td>${new Date(e.createdAt).toLocaleTimeString('sw-TZ',{hour:'2-digit',minute:'2-digit'})}</td><td class="right amount ${e.kind==='income'||e.kind==='agent-in'?'positive':'negative'}">${e.kind==='expense'||e.kind==='agent-out'?'−':'+'}${money(e.amount)}</td><td><button class="delete-btn" data-delete="${e.id}" aria-label="Futa muamala">×</button></td></tr>`).join('')}</tbody></table>`:`<div class="empty-state"><div class="empty-icon">▤</div><strong>Hakuna miamala bado</strong><span>Rekodi muamala wako wa kwanza hapo juu.</span></div>`}</div>
    </section>
    <footer>DUKA & WAKALA LEDGER <span>·</span> HIFADHI SALAMA YA BIASHARA YAKO</footer>
  </main>`;

  document.getElementById('kind').onchange=e=>document.getElementById('channelWrap').classList.toggle('hidden',!e.target.value.startsWith('agent-'));
  document.getElementById('entryForm').onsubmit=e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);const kind=f.get('kind'),amount=Number(f.get('amount'));if(!amount||amount<1)return;
    const channel=kind.startsWith('agent-')?f.get('channel'):'';
    if(kind==='agent-in') data.balances[channel]=balanceFor(channel)+amount;
    if(kind==='agent-out') data.balances[channel]=balanceFor(channel)-amount;
    data.entries.unshift({id:uid(),date:todayKey(),createdAt:new Date().toISOString(),kind,amount,category:f.get('category'),channel,note:f.get('note').trim()});
    save();
  };
  document.getElementById('balanceBtn').onclick=()=>{
    const channel=prompt(`Chagua mtandao:\n${CHANNELS.map((c,i)=>`${i+1}. ${c}`).join('\n')}`);
    const index=Number(channel)-1;if(index<0||index>=CHANNELS.length)return;
    const value=prompt(`Ingiza salio la ${CHANNELS[index]} (TZS):`,String(balanceFor(CHANNELS[index])));if(value===null)return;
    data.balances[CHANNELS[index]]=Number(value)||0;save();
  };
  document.querySelectorAll('[data-delete]').forEach(btn=>btn.onclick=()=>{
    const entry=data.entries.find(e=>e.id===btn.dataset.delete);if(!entry)return;
    if(!confirm('Una uhakika unataka kufuta muamala huu?'))return;
    if(entry.kind==='agent-in')data.balances[entry.channel]=balanceFor(entry.channel)-entry.amount;
    if(entry.kind==='agent-out')data.balances[entry.channel]=balanceFor(entry.channel)+entry.amount;
    data.entries=data.entries.filter(e=>e.id!==entry.id);save();
  });
  const installBtn=document.getElementById('installBtn');
  installBtn.textContent=window.matchMedia('(display-mode: standalone)').matches?'Installed':'Install app';
  installBtn.onclick=async()=>{
    if(window.__dukaInstallPrompt){
      window.__dukaInstallPrompt.prompt();
      await window.__dukaInstallPrompt.userChoice;
      window.__dukaInstallPrompt=null;
      installBtn.textContent='Install app';
      return;
    }
    const isApple=/iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isApple?'Install: open this link in Safari, tap Share, then “Add to Home Screen”. Open the installed app once online to cache it for offline use.':'Install: use your browser menu and choose “Install app” or “Add to Home Screen”. Open it once online so it can cache files for offline use.');
  };
}
function labelFor(kind){return ({income:'Mauzo',expense:'Matumizi','agent-in':'Wakala · Cash-in','agent-out':'Wakala · Cash-out'})[kind]||kind;}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();window.__dukaInstallPrompt=event;const button=document.getElementById('installBtn');if(button)button.textContent='Install app';});
render();
