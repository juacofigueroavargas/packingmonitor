
function renderLiveAxisChart(){
 const root=document.getElementById('live-bars');if(!root)return;
 const width=Math.max(380,Math.round(root.clientWidth||760));
 const height=Math.max(260,Math.round(root.clientHeight||445));
 const left=84,right=width-18,top=37,bottom=height-73,max=7000;
 const y=v=>bottom-v/max*(bottom-top);
 const grid=[0,1000,2000,3000,4000,5000,6000,7000].map(v=>`<line x1="${left}" x2="${right}" y1="${y(v)}" y2="${y(v)}" stroke="#e5edf0" stroke-width="1"/><text x="${left-11}" y="${y(v)+4}" text-anchor="end" fill="#7389a0" font-size="12">${v.toLocaleString('es-CL')}</text>`).join('');
 const step=(right-left)/hourly.length, barWidth=Math.min(75,step*.62);
 const bars=hourly.map(([time,kg],i)=>{const cx=left+step*(i+.5), yy=y(kg);return `<rect x="${cx-barWidth/2}" y="${yy}" width="${barWidth}" height="${bottom-yy}" rx="5" fill="url(#liveBarGradient)"/><text x="${cx}" y="${yy-13}" text-anchor="middle" fill="#076e52" font-size="12" font-weight="700">${kg.toLocaleString('es-CL')}</text><text x="${cx}" y="${bottom+25}" text-anchor="middle" fill="#71869c" font-size="12">${time}</text>`}).join('');
 root.innerHTML=`<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="liveBarGradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8bdcc1"/><stop offset="1" stop-color="#13a47b"/></linearGradient></defs>${grid}<line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#8fa3b3" stroke-width="1.5"/><line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#8fa3b3" stroke-width="1.5"/><line x1="${left}" x2="${right}" y1="${y(6500)}" y2="${y(6500)}" stroke="#e9a531" stroke-width="2" stroke-dasharray="7 5"/>${bars}<text x="${(left+right)/2}" y="${height-13}" text-anchor="middle" fill="#536b81" font-size="14" font-weight="600">Horas de producción</text><text x="23" y="${(top+bottom)/2}" text-anchor="middle" transform="rotate(-90 23 ${(top+bottom)/2})" fill="#536b81" font-size="14" font-weight="600">Rendimiento (kg/h)</text></svg>`;
}
let liveChartResizeFrame=0;
if(typeof ResizeObserver!=='undefined'){
 const chartRoot=document.getElementById('live-bars');
 if(chartRoot)new ResizeObserver(()=>{cancelAnimationFrame(liveChartResizeFrame);liveChartResizeFrame=requestAnimationFrame(renderLiveAxisChart)}).observe(chartRoot);
}else window.addEventListener('resize',renderLiveAxisChart);

const hourly=[['08:00',4320,640],['09:00',5100,710],['10:00',5850,750],['11:00',6420,810],['12:00',5600,730],['13:00',5980,760],['14:00',6240,780]];function bars(id){document.getElementById(id).innerHTML='<div class="target"></div>'+hourly.map(([h,k])=>`<div class="bar-group"><div class="bar-value">${k.toLocaleString('es-CL')}</div><div class="bar-area"><div class="bar-fill" style="--bar:${k/8000*100}%"></div></div><div class="bar-time">${h}</div></div>`).join('')}bars('hour-bars');renderLiveAxisChart();const dist=[['Exportación','82,4%','40.063 kg','#159c77',82.4],['Mercado interno','10,2%','4.960 kg','#f2b13f',10.2],['Precalibre','4,6%','2.237 kg','#fb792e',4.6],['Desecho / merma','2,8%','1.360 kg','#dc4053',2.8]];document.getElementById('distribution').innerHTML=dist.map(([n,p,k,c,v])=>`<div class="distribution-item"><span class="bullet" style="background:${c}"></span><span>${n}</span><b>${p}</b><div class="track"><span style="width:${v}%;background:${c}"></span></div><small>${k}</small></div>`).join('');document.getElementById('hour-table').innerHTML=hourly.map(([h,k,e])=>`<tr><td>${h}</td><td><b>${k.toLocaleString('es-CL')}</b></td><td>${e}</td></tr>`).join('');const hist=[['2457','Agrícola El Maitén',57280,'84,6%','11/10'],['2456','Frutícola Los Robles',62140,'79,8%','11/10'],['2455','Agrícola San José',49760,'81,3%','10/10'],['2454','Frutícola El Valle',54920,'77,5%','10/10'],['2453','Agrícola Las Palmas',62240,'81,2%','09/10']];document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===b.dataset.screen))}));document.getElementById('density').addEventListener('change',e=>document.body.classList.toggle('view-compact',e.target.value==='compact'));

// Configuración por instalación; sin depender de un proveedor de datos concreto.
const BRAND_PRESETS={neutral:{name:'PACKING',color:'#079d70'},grin:{name:'GRIN GROUP',color:'#157f7d'},geofrut:{name:'GEOFRUT',color:'#0c9866'}};
function applyBrand(name,color){const valid=/^#[0-9a-fA-F]{6}$/.test(color);if(!valid)return;document.documentElement.style.setProperty('--brand-primary',color);document.documentElement.style.setProperty('--brand-deep',color);document.documentElement.style.setProperty('--brand-soft',color+'17');document.getElementById('brand-logo').textContent=name;document.getElementById('brand-label').value=name;document.getElementById('brand-color').value=color;}
const brandSelect=document.getElementById('brand-preset');
brandSelect.addEventListener('change',()=>{const p=BRAND_PRESETS[brandSelect.value];applyBrand(p.name,p.color);document.getElementById('brand-feedback').textContent='Vista previa aplicada';});
document.getElementById('brand-label').addEventListener('input',e=>{document.getElementById('brand-logo').textContent=e.target.value||'PACKING';});
document.getElementById('brand-color').addEventListener('input',e=>applyBrand(document.getElementById('brand-label').value,e.target.value));
document.getElementById('reset-brand').addEventListener('click',()=>{brandSelect.value='neutral';applyBrand('PACKING','#079d70');document.getElementById('brand-feedback').textContent='Identidad restablecida';});
// Endpoint PHP listo para recibir posteriormente un proveedor SQL Anywhere.
async function checkDemoAPI(){try{const r=await fetch('data/sample.json',{cache:'no-store'});if(!r.ok)throw new Error('API '+r.status);const payload=await r.json();if(payload.source!=='demo')throw new Error('Origen inesperado');document.documentElement.dataset.dataSource=payload.source;}catch(err){console.warn('Datos de muestra locales activos; API no disponible:',err.message);}}
checkDemoAPI();


// Igualar la altura de la ficha de línea a la primera fila de KPI, incluso al redimensionar.
(function alignLineCardToKpis(){
  const kpiRow=document.querySelector('#live .top-grid');
  const lineCard=document.querySelector('.process-line-card');
  if(!kpiRow||!lineCard)return;
  const sync=()=>{
    if(window.innerWidth<=900){lineCard.style.removeProperty('--live-kpi-height');return;}
    const height=kpiRow.getBoundingClientRect().height;
    if(height>0)lineCard.style.setProperty('--live-kpi-height',`${height}px`);
  };
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(sync).observe(kpiRow);
  window.addEventListener('resize',sync);
  sync();
})();
