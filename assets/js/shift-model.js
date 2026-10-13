(()=>{'use strict';
/* Una jornada, una lista de procesos y un único registro de producción simulado. */
const lineConfig={name:"UNITEC 1",installedLanes:24,activeLanes:24};
const rates=[4320,5100,5850,6420,5600,5980,6240,5810,6320,6070];
const plans=[2600,3400,2900,3100,2800,3200,2700,3300,3000,3000,3200,2800,3100,2900,3400,2600,3200,2800,3100,2900];
const processes=plans.map((plannedKg,i)=>({id:2458+i,plannedKg,producerCode:String(748+i).padStart(4,'0'),producerName:'Productor de cerezas',species:'Cerezas',variety:'Santina'}));
const shiftPlan=plans.reduce((a,b)=>a+b,0);
function cumulative(t){const h=Math.max(0,Math.min(10,t));return rates.reduce((a,v,i)=>a+v*Math.max(0,Math.min(1,h-i)),0)}
function atKilos(kg){let remaining=kg;for(let i=0;i<rates.length;i++){if(remaining<=rates[i])return i+remaining/rates[i];remaining-=rates[i]}return 10}
function state(t){
 t=Math.max(0,Math.min(10,t));
 const hourly=rates.map((v,i)=>Math.round(v*Math.max(0,Math.min(1,t-i))));
 const total=hourly.reduce((a,b)=>a+b,0);
 let prior=0,completed=0,active=null;
 const byProcess=processes.map(p=>{const vaciado=Math.min(p.plannedKg,Math.max(0,total-prior));const startKg=prior;prior+=p.plannedKg;const item={...p,vaciado,startKg,startT:atKilos(startKg)};if(vaciado>=p.plannedKg)completed++;else if(!active)active=item;return item});
 const rate=t>0?rates[Math.min(9,Math.floor(Math.max(0,t-0.000001)))]:0;
 const avg=t>0?total/t:0,remaining=Math.max(0,shiftPlan-total),projectedAt=avg>0?8+t+remaining/avg:null;
 const processHourly=active?rates.map((_,i)=>{const before=cumulative(i),after=cumulative(Math.min(i+1,t));return Math.max(0,Math.min(after,active.startKg+active.plannedKg)-Math.max(before,active.startKg))}):Array(10).fill(0);
 const processFiveMinute=[];
 let processRate=0;
 if(active){
   const elapsedMinutes=Math.max(0,(t-active.startT)*60);
   const count=Math.min(120,Math.ceil(elapsedMinutes/5));
   for(let i=0;i<count;i++){
     const start=active.startT+i/12;
     const end=Math.min(t,start+1/12);
     if(end<=start)continue;
     const startKg=Math.max(0,Math.min(active.plannedKg,cumulative(start)-active.startKg));
     const endKg=Math.max(0,Math.min(active.plannedKg,cumulative(end)-active.startKg));
     const kg=Math.max(0,endKg-startKg);
     processFiveMinute.push({label:`${i*5}–${(i+1)*5}`,kg,minutes:(end-start)*60});
   }
   const last=processFiveMinute[processFiveMinute.length-1];
   // Cada barra es un bloque nominal de 5 minutos: la KPI usa exactamente
   // los kilos visibles en el ultimo bloque, sin extrapolar minutos parciales.
   processRate=last?last.kg*12:0;
 }
 return {lineConfig,t,hourly,hourlyRates:rates,total,avg,rate,remaining,shiftPlan,processes:byProcess,active,completed,worked:completed+(active&&active.vaciado>0?1:0),projectedAt,shiftStart:8,shiftEnd:18,processHourly,processFiveMinute,processRate};
}
window.PackingShiftDemo={state,shiftPlan,processes,cumulative,atKilos,lineConfig};
})();
