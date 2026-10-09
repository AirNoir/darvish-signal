// 資料驅動的產業地圖（無人機 / 機器人）：讀 window.SECTOR 渲染產業鏈卡片與台灣企業牆。
// 視覺沿用 style.css + darvish.css；公司卡與對話框 markup 與 AI 地圖一致。
(function(){
const S=window.SECTOR;if(!S)return;
const byCode=Object.fromEntries(S.companies.map(c=>[c.code,c]));

// --- 產業鏈 stage 卡片 ---
const chainHost=document.querySelector('#chain-grid');
chainHost.innerHTML=S.stages.map((st,i)=>`<article class="stage-card"><div class="stage-head"><span class="stage-num">0${i+1}</span><h3>${st.name}</h3></div><div class="stage-en">${st.en}</div><p>${st.desc}</p><div class="stage-chips">${st.codes.map(code=>{const c=byCode[code];return c?`<button data-code="${code}"><span>${c.name}</span><code>${code}</code></button>`:''}).join('')}</div></article>`).join('');

// --- 公司牆（搜尋 + 分類 filter） ---
const categories=['全部企業',...new Set(S.companies.map(c=>c.category))];
let activeCategory='全部企業';
function renderCompanies(category){
 activeCategory=category;
 const query=document.querySelector('#company-search').value.trim().toLowerCase();
 const list=S.companies.filter(c=>(category==='全部企業'||c.category===category)&&(!query||[c.name,c.en,c.code,c.brief].join(' ').toLowerCase().includes(query)));
 document.querySelector('#company-count').textContent=`${list.length} / ${S.companies.length} 家台股企業`;
 document.querySelector('#companies').innerHTML=list.map(c=>`<button class="company" data-code="${c.code}" aria-label="查看 ${c.name} ${c.code} 的產業角色"><span class="company-top"><span>${c.category}</span>${c.market}</span><span class="company-name">${c.name}<code>${c.code}</code></span><span class="en">${c.en}</span><span class="company-brief">${c.brief}</span><span class="company-link">認識這家公司 <b>↗</b></span></button>`).join('')||'<p class="empty">沒有符合的公司，試試其他名稱或代碼。</p>';
}
categories.forEach((c,i)=>{const b=document.createElement('button');b.className='filter'+(!i?' selected':'');b.textContent=c;b.setAttribute('aria-pressed',!i);b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b)});renderCompanies(c)};document.querySelector('#filters').append(b)});
document.querySelector('#company-search').addEventListener('input',()=>renderCompanies(activeCategory));

// --- 公司對話框（精簡 archive：角色說明 + 達比訊號連結 + 官方來源） ---
const dialog=document.querySelector('#company-dialog');
function openCompany(code){
 const c=byCode[code];if(!c)return;
 const stages=S.stages.filter(st=>st.codes.includes(code));
 document.querySelector('#company-history').innerHTML=`<div class="sector-archive"><div class="eyebrow">COMPANY / ${c.market}</div><h2 id="history-title">${c.name} <code>${c.code}</code></h2><div class="english">${c.en}</div><div class="history-category">${c.category}</div><a class="chart-link" href="/app/${encodeURIComponent(c.code)}" target="_top" aria-label="查看 ${c.name} ${c.code} 的達比訊號">查看達比訊號 <span>${c.code} · K-Zone</span></a><section class="archive-section"><h3>在${S.shortName}產業中的角色</h3><p>${c.role||c.brief}</p><div class="role-tags">${stages.map(st=>`<span>${st.name}</span>`).join('')}</div></section>${c.site?`<a class="official-link" href="${c.site}" target="_blank" rel="noopener">官方網站 ↗</a>`:''}<div class="archive-note">產業角色為代表性整理，並非特定機種或專案的供應鏈名單；不含即時行情或投資建議。</div></div>`;
 dialog.showModal();dialog.scrollTop=0;
}
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-code]');if(trigger)openCompany(trigger.dataset.code)});
document.querySelector('#history-close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

renderCompanies('全部企業');
})();
