const profiles=window.COMPANY_PROFILES;
const companies=profiles.filter(c=>c.taiwan).map(c=>[c.name,c.en,c.code,c.category,c.brief,c.market]);
const layers=[{zh:'AI 運算核心',en:'AI COMPUTE',icon:'◈',desc:'晶片城市的運算中樞。GPU、張量運算單元與 SRAM 協同處理龐大的 AI 工作負載，透過高速互連交換資料。',tags:['GPU / ASIC','Tensor cores','SRAM','Chiplets'],stocks:[1,2],note:'台積電（TWSE 2330）提供晶圓製造；晶片設計與製造分屬不同角色。'}, {zh:'先進封裝',en:'ADVANCED PACKAGING',icon:'▧',desc:'把運算晶粒與記憶體整合成一個系統。2.5D 封裝、微凸塊與混合鍵合，在微小的空間裡建立高密度連接。',tags:['CoWoS','2.5D integration','Micro bumps','Hybrid bonding'],stocks:[0,3]}, {zh:'HBM 記憶體',en:'HBM MEMORY',icon:'▤',desc:'緊鄰運算核心的垂直記憶體塔。多層 DRAM 透過 TSV 互連，提供 AI 加速器所需的高頻寬資料存取。',tags:['Stacked DRAM','TSV','Wide interface'],foreign:[['SK hynix','KRX 000660'],['Micron','NASDAQ MU']],note:'HBM 主要供應商為國際記憶體廠；台灣封裝與材料企業參與周邊整合，不等同 HBM 製造商。'}, {zh:'矽中介層',en:'SILICON INTERPOSER',icon:'⌘',desc:'晶粒之間的微型交通網絡。細密金屬走線將 GPU、HBM 與 chiplets 連接，縮短資料傳輸距離。',tags:['Silicon interposer','RDL','Die-to-die'],stocks:[0]}, {zh:'ABF 載板',en:'ABF SUBSTRATE',icon:'▱',desc:'從微小晶粒通往系統的橋樑。多層銅走線與導通孔承接訊號與電源，將封裝連接至電路板。',tags:['ABF','Copper traces','Vias','Power delivery'],stocks:[4,5,6]}, {zh:'PCB / 伺服器',en:'PCB / SERVER',icon:'▦',desc:'支撐 AI 運算的基礎設施。高層數 PCB、供電、網路與散熱，讓加速器在伺服器系統裡穩定運作。',tags:['High-layer PCB','Networking','Cooling'],stocks:[7,8,9,10,11]}];

const nvidia='https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/';
const samsung='https://semiconductor.samsung.com/foundry/advanced-package/advanced-heterogeneous-integration/';
const hbm='https://semiconductor.samsung.com/news-events/news/samsung-electronics-develops-industrys-first-12-layer-3d-tsv-chip-packaging-technology/';
const ajinomoto='https://www.ajinomoto.com/innovation/our_innovation/buildupfilm';
const refs=[
 [{name:'NVIDIA · H100 實際模組照片 / 核心架構',url:nvidia}],
 [{name:'Samsung · 2.5D 封裝剖面圖',url:samsung},{name:'TSMC · CoWoS 技術結構',url:'https://3dfabric.tsmc.com/english/dedicatedFoundry/technology/cowos.htm'}],
 [{name:'Samsung · DRAM 堆疊與 TSV 剖面圖',url:hbm}],
 [{name:'Samsung · Si-interposer 剖面圖',url:samsung}],
 [{name:'Ajinomoto · ABF 多層載板結構圖',url:ajinomoto}],
 [{name:'NVIDIA · H100 SXM5 電路板照片',url:nvidia}]
];
layers[1].desc='以微凸塊與封裝框架，將運算晶粒、HBM 和中介層連成一體。抽出視圖放大鍵合介面，讓密集的連接點清楚可見。';
layers[2].desc='與 GPU 並排的記憶體塔，而非 GPU 下方的一整塊記憶體。模型展示八層 DRAM 與垂直 TSV，層數為教學示意。';

let selected=0;const layerHost=document.querySelector('#layers');layers.forEach((l,i)=>{const b=document.createElement('button');b.className='layer';b.innerHTML=`<span class="num">0${i+1}</span><span><strong>${l.zh}</strong><small>${l.en}</small></span><span class="dot">●</span>`;b.onclick=()=>selectLayer(i);layerHost.append(b)});
function selectLayer(i,extract=true){selected=i;const l=layers[i];document.querySelectorAll('.layer').forEach((b,j)=>{b.classList.toggle('selected',i===j);b.setAttribute('aria-pressed',i===j)});document.querySelector('#extracted-name').textContent=l.zh;document.querySelector('#selection-caption').textContent=extract?'已抽出 · '+l.zh:'展開全貌 · 點選任一層抽出';if(extract)window.dispatchEvent(new CustomEvent('chip-layer-select',{detail:i}));const stocks=l.foreign||l.stocks.map(j=>[companies[j][0],companies[j][5]+' '+companies[j][2]]);document.querySelector('#detail').innerHTML=`<div class="tag">LAYER 0${i+1} / 06</div><div class="symbol">${l.icon}</div><h2>${l.zh}</h2><div class="english">${l.en}</div><p>${l.desc}</p><div class="tech-tags">${l.tags.map(t=>`<span>${t}</span>`).join('')}</div><div class="related"><div class="related-label">${l.foreign?'GLOBAL PLAYERS':'關鍵台灣企業'}</div>${stocks.map(s=>`<button class="stock" data-code="${s[1].split(' ').pop()}" aria-label="查看 ${s[0]} 公司簡介"><span>${s[0]}</span><code>${s[1]} ↗</code></button>`).join('')}</div>${l.note?`<div class="detail-foot">${l.note}</div>`:''}<div class="model-reference"><div>REFERENCE / 圖像依據</div>${refs[i].map(r=>`<a href="${r.url}" target="_blank" rel="noopener">${r.name} ↗</a>`).join('')}<small>依官方照片與結構圖建模，卡通渲染；非產品精確複刻。</small></div>`;}
window.selectChipLayer=selectLayer;selectLayer(0,false);

const categories=['全部企業',...new Set(profiles.filter(c=>c.taiwan).map(c=>c.category))];
let activeCategory='全部企業';
function renderCompanies(category){activeCategory=category;const query=document.querySelector('#company-search').value.trim().toLowerCase();const list=profiles.filter(c=>c.taiwan&&(category==='全部企業'||c.category===category)&&(!query||[c.name,c.en,c.code,c.brief].join(' ').toLowerCase().includes(query)));document.querySelector('#company-count').textContent=`${list.length} / ${profiles.filter(c=>c.taiwan).length} 家台股企業`;document.querySelector('#companies').innerHTML=list.map(c=>`<button class="company" data-code="${c.code}" aria-label="查看 ${c.name} ${c.code} 的歷史簡介"><span class="company-top"><span>${c.category}</span>${c.market}</span><span class="company-name">${c.name}<code>${c.code}</code></span><span class="en">${c.en}</span><span class="company-brief">${c.brief}</span><span class="company-link">認識這家公司 <b>↗</b></span></button>`).join('')||'<p class="empty">沒有符合的公司，試試其他名稱或代碼。</p>';}
categories.forEach((c,i)=>{const b=document.createElement('button');b.className='filter'+(!i?' selected':'');b.textContent=c;b.setAttribute('aria-pressed',!i);b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b)});renderCompanies(c)};document.querySelector('#filters').append(b)});
document.querySelector('#company-search').addEventListener('input',()=>renderCompanies(activeCategory));
const dialog=document.querySelector('#company-dialog');
function openCompany(code){
 const c=profiles.find(c=>c.code===code);if(!c)return;
 const mappings=(window.INDUSTRIES||[]).filter(x=>x.codes.includes(code)),basic=c.basic;
 const representative=mappings.find(x=>c.category.includes('光學')?x.id==='lens':c.code==='2308'?x.id==='power':true)||mappings[0];
 const thumb=representative&&document.querySelector(`[data-sketch="${window.INDUSTRIES.indexOf(representative)}"]`);
 const facts=basic?[['公司全名',basic.legalName],['法人設立',basic.established],['上市／上櫃',basic.listed],['董事長',basic.chairman],['總經理',basic.generalManager],['實收資本額',`${(Number(basic.capital)/100000000).toLocaleString('zh-TW',{maximumFractionDigits:2})} 億元`],['登記地址',basic.address]]:[];
 document.querySelector('#company-history').innerHTML=`<div class="eyebrow">COMPANY ARCHIVE / ${c.market}</div><h2 id="history-title">${c.name} <code>${c.code}</code></h2><div class="english">${c.en}</div><div class="history-category">${c.category}</div>${c.taiwan?`<a class="chart-link" href="/app/${encodeURIComponent(c.code)}" target="_top" aria-label="查看 ${c.name} ${c.code} 的 K 線">查看 ${c.code} K 線 <span>進入 K-Zone</span></a>`:''}${basic?`<dl class="company-facts">${facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${value||'—'}</dd></div>`).join('')}</dl><div class="registry-date">基本資料快照：${basic.asOf} · 法人設立日期與品牌創業年份可能不同。</div>`:`<div class="global-origin">${c.founded} · 公司起源</div>`}<div class="archive-body"><div><h3>公司做什麼</h3><p>${c.overview||c.brief}</p><h3>主要產品與服務</h3><div class="product-list">${(c.products||[]).map(x=>`<span>${x}</span>`).join('')}</div><h3>成立與發展</h3><p>${c.history}</p></div><div class="archive-role">${thumb&&thumb.src?`<figure class="history-sketch"><img src="${thumb.src}" alt="${representative.component} 的手繪風格模型"><figcaption>${representative.component} · 產業構件示意</figcaption></figure>`:''}<h3>在 AI 產業鏈中的角色</h3><p>${c.brief}</p><div class="history-mappings">${mappings.map(x=>`<span>${x.name} · ${x.component}</span>`).join('')}</div></div></div><div class="history-source"><a href="${c.source}" target="_blank" rel="noopener">官方公司介紹與沿革 ↗</a>${basic?`<a href="${basic.registrySource}" target="_blank" rel="noopener">證交所／櫃買中心基本資料 ↗</a>`:''}<small>產品角色為產業關聯整理；構件圖為依原廠資料製作的教學模型。</small></div>`;
 dialog.showModal();dialog.scrollTop=0;
}
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-code]');if(trigger)openCompany(trigger.dataset.code)});
document.querySelector('#history-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
renderCompanies('全部企業');
