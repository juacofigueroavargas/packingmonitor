(()=>{
'use strict';
const params=new URLSearchParams(location.search);const isDemo=params.get('demo')==='1';
const model=window.PackingShiftDemo,duration=90000;

const fmt=n=>Math.round(n).toLocaleString('es-CL');
const pct=n=>n.toFixed(1).replace('.',',')+'%';
const cards=document.querySelectorAll('#live .top-grid .card');
const mini=document.querySelectorAll('#live .secondary-grid .card');
const yieldCard=document.querySelector('.process-yield');
const chart=document.getElementById('live-bars');
const donut=document.querySelector('.donut');
const distRoot=document.getElementById('distribution');
const progress=document.querySelector('#live .line-svg');
const yieldParts=[.824,.102,.046,.028],colors=['#159c77','#f2b13f','#fb792e','#dc4053'];
let started=performance.now(),pausedAt=null,pausedTotal=0,halted=false,progressRatio=0;
const indicator=document.createElement('div');indicator.className='pm-demo-indicator';indicator.innerHTML='<span class="pm-demo-dot"></span><b>DEMO</b><span id="pm-demo-clock">08:00</span>';
if(isDemo)document.querySelector('.topbar')?.appendChild(indicator);
const clock=indicator.querySelector('#pm-demo-clock');
const liveChartCard=chart?.closest('.card');
if(liveChartCard){
 const head=liveChartCard.querySelector('.panel-title');
 if(head){const label=[...head.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.includes('EVOLUCIÓN'));if(label)label.textContent='EVOLUCIÓN DEL PROCESO';}
 const goal=liveChartCard.querySelector('.live-goal-label');
 if(goal)goal.innerHTML='<i></i>Meta: <strong>542 kg / 5 min</strong>';
 chart.setAttribute('aria-label','Kilos vaciados por intervalos de cinco minutos desde el inicio del proceso, con meta de 542 kg por intervalo');
}
const control=document.createElement('button');control.className='pm-demo-pause';control.type='button';control.textContent='Pausar';control.title='Pausar o reanudar la demostración';indicator.appendChild(control);
control.addEventListener('click',()=>{if(pausedAt===null){pausedAt=performance.now();control.textContent='Continuar'}else{pausedTotal+=performance.now()-pausedAt;pausedAt=null;control.textContent='Pausar'}});
const getTime=()=>pausedAt??performance.now();
function value(node,selector,text){const el=node?.querySelector(selector);if(el)el.textContent=text}
function drawBars(state){if(!chart)return;
 const p=state.active;
 const w=Math.max(380,Math.round(chart.clientWidth||700)),h=Math.max(240,Math.round(chart.clientHeight||370));
 const l=70,r=w-22,top=36,bottom=h-65;
 const meta=6500/12;
 const vals=state.processFiveMinute||[];
 const shown=vals.length?vals:[{label:'0–5',kg:0,minutes:5}];
 const max=Math.max(750,Math.ceil(Math.max(meta,...shown.map(v=>v.kg))*1.22/100)*100);
 const y=v=>bottom-v/max*(bottom-top),step=(r-l)/Math.max(6,shown.length),bw=Math.min(62,step*.55);
 const ticks=[0,.25,.5,.75,1].map(f=>{const v=max*f;return `<line x1="${l}" x2="${r}" y1="${y(v)}" y2="${y(v)}" stroke="#e5edf0"/><text x="${l-10}" y="${y(v)+4}" text-anchor="end" fill="#7389a0" font-size="12">${fmt(v)}</text>`}).join('');
 const bars=shown.map((item,j)=>{const x=l+step*(j+.5),yy=y(item.kg),label=item.label+(item.minutes<4.999?'*':'');
 return `<rect x="${x-bw/2}" y="${yy}" width="${bw}" height="${Math.max(0,bottom-yy)}" rx="5" fill="#23af88"/><text x="${x}" y="${Math.max(top+10,yy-10)}" text-anchor="middle" fill="#087b5e" font-size="12" font-weight="700">${fmt(item.kg)}</text><text x="${x}" y="${bottom+22}" text-anchor="middle" fill="#71869c" font-size="11">${label}</text>`}).join('');
 chart.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${ticks}<line x1="${l}" x2="${r}" y1="${bottom}" y2="${bottom}" stroke="#8fa3b3"/><line x1="${l}" x2="${r}" y1="${y(meta)}" y2="${y(meta)}" stroke="#e9a531" stroke-width="2" stroke-dasharray="7 5"/>${bars}<text x="${(l+r)/2}" y="${h-10}" text-anchor="middle" fill="#536b81" font-size="14">Minutos desde el inicio del proceso</text><text x="17" y="${(top+bottom)/2}" transform="rotate(-90 17 ${(top+bottom)/2})" text-anchor="middle" fill="#536b81" font-size="14">Kilos por intervalo</text></svg>`;
}
function drawProgress(kg,planned,state){if(!progress)return;
 const endX=35+410*kg/Math.max(1,planned),endY=136-111*kg/Math.max(1,planned);
 const steps=8,pts=Array.from({length:steps+1},(_,i)=>{const q=i/steps,x=35+(endX-35)*q,y=136+(endY-136)*q+Math.sin(q*Math.PI)*3;return `${x.toFixed(1)},${y.toFixed(1)}`});
 progress.innerHTML=`<defs><linearGradient id="demoArea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#28c995" stop-opacity=".24"/><stop offset="1" stop-color="#28c995" stop-opacity=".01"/></linearGradient></defs><path class="gridline" d="M35 25H450M35 62H450M35 99H450M35 136H450"/><text x="2" y="28">${fmt(planned)}</text><text x="2" y="65">${fmt(planned*.66)}</text><text x="2" y="102">${fmt(planned*.33)}</text><text x="17" y="139">0</text><path d="M35 136 L${pts.slice(1).join(' L')} L${endX} 136Z" fill="url(#demoArea)"/><polyline class="actual" points="${pts.join(' ')}" fill="none"/><path class="planned" d="M${endX} ${endY} L445 25"/><circle cx="${endX}" cy="${endY}" r="5" fill="#087d60"/><circle cx="445" cy="25" r="5" fill="#8ca1b6"/><text x="${Math.max(38,endX-25)}" y="${Math.max(16,endY-12)}" style="fill:#0a7258;font-weight:800">${fmt(kg)}</text><text x="405" y="16">${fmt(planned)}</text><text x="35" y="160">Inicio</text><text x="205" y="160">Avance del proceso</text><text x="414" y="160">Meta</text>`;
}
function render(){
 const elapsed=isDemo?((getTime()-started-pausedTotal)%duration)/duration:.65;
 const simulatedMinutes=Math.floor(elapsed*600),hr=8+Math.floor(simulatedMinutes/60),min=simulatedMinutes%60;
 clock.textContent=`${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
 const s=model.state(elapsed*10);window.PackingMonitorState=s;
 const p=s.active,planned=p?p.plannedKg:0,kg=p?p.vaciado:0,exportPct=kg?78.1+4.3*elapsed:0,currentRate=s.processRate||0;
 // En esta demo las barras son bloques nominales de cinco minutos.
 // Para que el promedio y la proyección correspondan al mismo eje visual,
 // se usa el número de bloques mostrados (incluido el último parcial).
 const intervalCount=p?(s.processFiveMinute||[]).length:0;
 const observedHours=intervalCount*5/60;
 const avg=observedHours>0?kg/observedHours:0;
 const info=document.querySelector('.process-information .process-number strong');if(info)info.textContent=p?p.id:'—';
 const facts=document.querySelectorAll('.process-information .process-fact strong');if(facts.length>=4){facts[0].textContent=p?p.species:'—';facts[1].textContent=p?p.variety:'—';facts[2].textContent=p?`${p.producerCode} ${p.producerName}`:'—';facts[3].textContent='Turno A - Día'}
 value(cards[0],'.hero-num',fmt(planned));value(cards[1],'.hero-num',fmt(kg));value(cards[1],'.vaciado-percent',planned?pct(kg/planned*100):'—');
 const track=cards[1]?.querySelector('.progressline .track span');if(track)track.style.width=planned?`${kg/planned*100}%`:'0%';
 value(cards[2],'.hero-num',fmt(currentRate));value(cards[2],'.positive',currentRate?'Último intervalo de 5 min · kg/h equivalentes':'Sin producción');
 value(mini[0],'.mini-num',avg?fmt(avg)+' kg/h':'—');value(mini[1],'.mini-num',fmt(s.lineConfig.activeLanes?currentRate/s.lineConfig.activeLanes:0)+' kg/h');value(mini[2],'.mini-num',currentRate?fmt(currentRate/8)+' env/h':'—');value(mini[3],'.mini-num',fmt(Math.max(0,planned-kg))+' kg');
 const remaining=avg>0?(planned-kg)/avg:null;
 value(mini[4],'.mini-num',remaining!==null?`${Math.floor(remaining)} h ${String(Math.round((remaining%1)*60)).padStart(2,'0')} min`:'—');
 value(yieldCard,'strong',kg?pct(exportPct):'—');const yt=yieldCard?.querySelector('.yield-track i');if(yt)yt.style.width=`${kg?exportPct:0}%`;
 if(donut){const total=Math.max(0,kg),portions=yieldParts.map((v,i)=>i===0?exportPct/100:(1-exportPct/100)*([.102,.046,.028][i-1]/.176));let cumulative=0;const segments=portions.map((p,i)=>{const a=cumulative*100;cumulative+=p;return `${colors[i]} ${a}% ${cumulative*100}%`});donut.style.background=`conic-gradient(${segments.join(',')})`;value(donut,'.donut-center strong',fmt(total));}
 if(distRoot)distRoot.innerHTML=['Exportación','Mercado interno','Precalibre','Desecho / merma'].map((name,i)=>{const portion=i===0?exportPct/100:(1-exportPct/100)*([.102,.046,.028][i-1]/.176);return `<div class="distribution-item"><span class="bullet" style="background:${colors[i]}"></span><span>${name}</span><b>${pct(portion*100)}</b><div class="track"><span style="width:${portion*100}%;background:${colors[i]}"></span></div><small>${fmt(kg*portion)} kg</small></div>`}).join('');
 drawBars(s);drawProgress(kg,planned,s);
}
setInterval(()=>{if(!isDemo||pausedAt===null)render()},150);render();
})();