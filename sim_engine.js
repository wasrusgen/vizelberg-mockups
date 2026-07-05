/* Флэш-симуляция «Машина в работе» — общий движок для cabinet.html и admin.html.
   Страница задаёт window.SIM_SCENES (массив сцен) и опционально window.SIM_NEXT {label,href}.
   Сцена: { view:номер экрана go(n) | null, sel:'css-селектор' | null, html:'демо-карточка',
            title:'заголовок', text:'подпись', run:function(){} } */
(function(){
var css = ''+
'.sim-launch{position:fixed;bottom:118px;right:18px;z-index:900;background:#2F4A3C;color:#fff;border:none;border-radius:100px;padding:13px 22px;font:600 13.5px/1 "Segoe UI",system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 26px rgba(30,40,32,.35);display:flex;align-items:center;gap:9px}'+
'.sim-launch:hover{background:#243B30}'+
'.sim-launch .gold{color:#C9A24B}'+
'.sim-spot{position:fixed;z-index:998;pointer-events:none;border-radius:14px;box-shadow:0 0 0 9999px rgba(24,34,27,.62), 0 0 0 3px rgba(201,162,75,.9);transition:all .38s cubic-bezier(.4,.1,.2,1)}'+
'.sim-dim{position:fixed;inset:0;z-index:998;background:rgba(24,34,27,.62);pointer-events:none}'+
'.sim-card{position:fixed;z-index:1001;width:min(430px,calc(100vw - 28px));background:#fff;border-radius:16px;box-shadow:0 22px 60px rgba(20,30,24,.4);font-family:"Segoe UI",system-ui,sans-serif;overflow:hidden;transition:top .38s cubic-bezier(.4,.1,.2,1), left .38s cubic-bezier(.4,.1,.2,1)}'+
'.sim-card-hd{padding:13px 18px 0;display:flex;align-items:center;gap:9px;flex-wrap:wrap}'+
'.sim-step{font-size:10.5px;font-weight:800;letter-spacing:.05em;color:#7C9070;text-transform:uppercase}'+
'.sim-x{margin-left:auto;width:26px;height:26px;border:none;background:#F5EFE6;border-radius:7px;cursor:pointer;color:#8A8578;font-size:14px;line-height:1}'+
'.sim-title{font-family:Georgia,serif;font-size:16.5px;font-weight:700;color:#2F4A3C;padding:7px 18px 0}'+
'.sim-text{font-size:13px;line-height:1.6;color:#2B2B26;padding:6px 18px 0}'+
'.sim-chap{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#C9A24B;background:rgba(201,162,75,.13);border-radius:100px;padding:3px 10px}'+
'.sim-hook{display:flex;gap:8px;align-items:flex-start;margin:10px 18px 0;background:rgba(201,162,75,.1);border-left:3px solid #C9A24B;border-radius:0 9px 9px 0;padding:8px 12px;font-size:12px;line-height:1.5;color:#6E5A22}'+
'.sim-hook b{color:#9A7A2E;font-weight:800;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;padding-top:1px}'+
'.sim-ft{display:flex;align-items:center;gap:10px;padding:14px 18px 15px}'+
'.sim-prog{flex:1;height:4px;background:#EDE7DA;border-radius:2px;overflow:hidden}'+
'.sim-prog i{display:block;height:100%;background:linear-gradient(90deg,#7C9070,#C9A24B);border-radius:2px;transition:width .3s}'+
'.sim-btn{border:none;border-radius:9px;font:600 12.5px "Segoe UI",system-ui,sans-serif;cursor:pointer;padding:9px 16px}'+
'.sim-back{background:#F5EFE6;color:#5C7050}'+
'.sim-next{background:#2F4A3C;color:#fff}'+
'.sim-next:hover{background:#243B30}'+
'.sim-badge{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:1002;background:rgba(47,74,60,.92);color:#F5EFE6;font:600 11px "Segoe UI",system-ui,sans-serif;padding:6px 15px;border-radius:100px;letter-spacing:.02em}'+
'.sim-demo{position:fixed;z-index:999;top:50%;left:50%;transform:translate(-50%,-56%);width:min(560px,calc(100vw - 28px));max-height:62vh;overflow-y:auto;background:#fff;border-radius:18px;box-shadow:0 26px 70px rgba(20,30,24,.45);padding:22px 24px;font-family:"Segoe UI",system-ui,sans-serif;animation:simpop .3s ease}'+
'@keyframes simpop{from{opacity:0;transform:translate(-50%,-52%)}to{opacity:1;transform:translate(-50%,-56%)}}'+
'.simd-tag{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#7C9070;margin-bottom:5px}'+
'.simd-h{font-family:Georgia,serif;font-size:18px;font-weight:700;color:#2F4A3C;margin-bottom:12px}'+
'.simd-row{display:flex;gap:11px;align-items:flex-start;padding:9px 0;border-bottom:1px solid #EDE7DA;font-size:12.5px;color:#2B2B26;line-height:1.5}'+
'.simd-row:last-child{border-bottom:none}'+
'.simd-ic{width:30px;height:30px;border-radius:9px;background:#F5EFE6;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}'+
'.simd-pill{display:inline-block;font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:100px;background:rgba(201,162,75,.18);color:#9A7A2E;margin-left:6px}'+
'.simd-pill.ok{background:rgba(124,144,112,.16);color:#5C7050}'+
'.simd-pill.red{background:rgba(192,88,79,.13);color:#C0584F}'+
'.simd-field{border:1.5px solid #E4DDD0;border-radius:10px;padding:10px 13px;font-size:12.5px;color:#8A8578;margin-bottom:9px;background:#FBF9F5}'+
'.simd-field b{color:#2B2B26;font-weight:600}'+
'.simd-tbl{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}'+
'.simd-tbl th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#8A8578;padding:6px 8px;border-bottom:1px solid #E4DDD0}'+
'.simd-tbl td{padding:7px 8px;border-bottom:1px solid #F0EAE0;color:#2B2B26}'+
'.simd-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:middle}'+
'.simd-bars{display:flex;align-items:flex-end;gap:5px;height:64px;margin:10px 0 4px}'+
'.simd-bars i{flex:1;background:linear-gradient(180deg,#7C9070,rgba(124,144,112,.35));border-radius:4px 4px 0 0}'+
'.simd-flow{display:flex;flex-direction:column;gap:0;margin-top:6px}'+
'.simd-fstep{display:flex;gap:11px;align-items:center;padding:8px 0}'+
'.simd-fnum{width:26px;height:26px;border-radius:50%;background:#C9A24B;color:#2F4A3C;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}'+
'.simd-farr{color:#7C9070;font-size:14px;padding-left:9px}'+
'.simd-note{font-size:11.5px;color:#8A8578;margin-top:12px;line-height:1.5;border-top:1px solid #EDE7DA;padding-top:10px}'+
'.simd-btnrow{margin-top:12px}'+
'.simd-btn{display:inline-block;background:#2F4A3C;color:#fff;border-radius:10px;padding:10px 18px;font-size:12.5px;font-weight:600}'+
'.simd-chk{display:flex;gap:10px;align-items:flex-start;background:#FBF9F5;border:1.5px solid #7C9070;border-radius:10px;padding:11px 13px;font-size:12px;line-height:1.5;color:#2B2B26}'+
'.simd-chk .box{width:18px;height:18px;border-radius:5px;background:#7C9070;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px}';
var styleEl=document.createElement('style'); styleEl.textContent=css; document.head.appendChild(styleEl);

var S={i:0,on:false,spot:null,card:null,badge:null,demo:null,shield:null,target:null,raf:null};

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;}

function start(fromIdx){
  if(S.on) return;
  S.on=true; S.i=(typeof fromIdx==='number' && fromIdx>=0 && fromIdx<window.SIM_SCENES.length)?fromIdx:0;
  S.badge=el('div','sim-badge','Симуляция · демо-данные · ничего не отправляется');
  document.body.appendChild(S.badge);
  // щит: на время симуляции клики по странице не проходят (мокап не «уезжает»)
  S.shield=el('div'); S.shield.style.cssText='position:fixed;inset:0;z-index:997;background:transparent';
  document.body.appendChild(S.shield);
  S.card=el('div','sim-card');
  document.body.appendChild(S.card);
  show();
  window.addEventListener('resize',reposition);
  document.addEventListener('scroll',onScroll,true);
  document.addEventListener('keydown',onKey);
}
function stop(){
  S.on=false;
  [S.spot,S.card,S.badge,S.demo,S.shield].forEach(function(x){if(x&&x.parentNode)x.parentNode.removeChild(x);});
  S.spot=S.card=S.badge=S.demo=S.shield=null; S.target=null;
  window.removeEventListener('resize',reposition);
  document.removeEventListener('scroll',onScroll,true);
  document.removeEventListener('keydown',onKey);
  if(typeof window.simCleanup==='function') window.simCleanup();
}
var scrollT=null;
function onScroll(){ if(scrollT)return; scrollT=setTimeout(function(){scrollT=null; refreshSpot();},80); }
function refreshSpot(){
  if(!S.on||!S.target) return;
  var r=S.target.getBoundingClientRect();
  if(!S.spot) return;
  var pad=8;
  S.spot.style.top=(r.top-pad)+'px'; S.spot.style.left=(r.left-pad)+'px';
  S.spot.style.width=(r.width+pad*2)+'px'; S.spot.style.height=(r.height+pad*2)+'px';
  placeCard(r);
}
function onKey(e){
  if(e.key==='Enter' && S.card && S.card.contains(document.activeElement)) return; // иначе click+Enter = двойной шаг
  if(e.key==='ArrowRight'||e.key==='Enter') next();
  else if(e.key==='ArrowLeft') back();
  else if(e.key==='Escape') stop();
}
function next(){ if(S.i>=window.SIM_SCENES.length-1){ finish(); return;} S.i++; show(); }
function back(){ if(S.i>0){S.i--; show();} }
function finish(){
  if(window.SIM_NEXT){ location.href=window.SIM_NEXT.href; } else { stop(); }
}
function clearDemo(){ if(S.demo){S.demo.parentNode.removeChild(S.demo);S.demo=null;} }
function clearSpot(){ if(S.spot){S.spot.parentNode.removeChild(S.spot);S.spot=null;} }

function show(){
  var sc=window.SIM_SCENES[S.i];
  clearDemo();
  // переключение экрана мокапа
  if(typeof sc.view==='number' && typeof window.go==='function') window.go(sc.view);
  if(typeof sc.run==='function'){ try{sc.run();}catch(e){} }
  // подсветка
  if(sc.html){
    S.target=null; clearSpot();
    var dim=el('div','sim-dim'); dim.className='sim-spot'; dim.style.cssText='top:-20px;left:-20px;width:0;height:0;border-radius:0;box-shadow:0 0 0 9999px rgba(24,34,27,.62)';
    S.spot=dim; document.body.appendChild(dim);
    S.demo=el('div','sim-demo',sc.html);
    document.body.appendChild(S.demo);
    placeCard(null);
  } else if(sc.sel){
    setTimeout(function(){ anchor(sc.sel); },(typeof sc.view==='number')?60:0);
  } else {
    S.target=null; clearSpot(); placeCard(null);
  }
  renderCard(sc);
}

function anchor(sel){
  if(typeof sel==='function'){ try{sel=sel();}catch(e){sel=null;} }
  var t=sel?document.querySelector(sel):null;
  if(!t){ S.target=null; clearSpot(); placeCard(null); return; }
  S.target=t;
  try{ t.scrollIntoView({block:'center',behavior:'auto'}); }catch(e){}
  function measure(){
    var r=t.getBoundingClientRect();
    if(!S.spot){ S.spot=el('div','sim-spot'); document.body.appendChild(S.spot); }
    var pad=8;
    S.spot.style.top=(r.top-pad)+'px'; S.spot.style.left=(r.left-pad)+'px';
    S.spot.style.width=(r.width+pad*2)+'px'; S.spot.style.height=(r.height+pad*2)+'px';
    S.spot.style.borderRadius='14px';
    S.spot.style.boxShadow='0 0 0 9999px rgba(24,34,27,.62), 0 0 0 3px rgba(201,162,75,.9)';
    placeCard(r);
  }
  setTimeout(measure,40);
  // повторный замер: скролл/шрифты могли доехать после первого
  setTimeout(function(){ try{ t.scrollIntoView({block:'center',behavior:'auto'}); }catch(e){} measure(); },380);
}

function placeCard(r){
  if(!S.card) return;
  var ch=S.card.offsetHeight||170, cw=Math.min(430,window.innerWidth-28);
  var top,left;
  if(!r){ top=window.innerHeight-ch-18; left=(window.innerWidth-cw)/2; }
  else{
    var below=r.bottom+14, above=r.top-ch-14;
    top=(below+ch<window.innerHeight-10)?below:(above>10?above:window.innerHeight-ch-18);
    left=Math.min(Math.max(14,r.left),window.innerWidth-cw-14);
  }
  S.card.style.top=top+'px'; S.card.style.left=left+'px';
}

function renderCard(sc){
  var n=S.i+1,total=window.SIM_SCENES.length;
  var last=(S.i===total-1);
  var nextLabel = last ? (window.SIM_NEXT?window.SIM_NEXT.label:'Завершить') : 'Дальше →';
  S.card.innerHTML=
    '<div class="sim-card-hd"><span class="sim-step">'+(window.SIM_ACT||'Симуляция')+' · шаг '+n+' из '+total+'</span>'+(sc.chap?'<span class="sim-chap">'+sc.chap+'</span>':'')+'<button class="sim-x" title="Выйти">✕</button></div>'+
    (sc.title?'<div class="sim-title">'+sc.title+'</div>':'')+
    '<div class="sim-text">'+sc.text+'</div>'+
    (sc.hook?'<div class="sim-hook"><b>'+(window.SIM_HOOK_LABEL||'Крючок')+'</b><span>'+sc.hook+'</span></div>':'')+
    '<div class="sim-ft"><button class="sim-btn sim-back"'+(S.i===0?' style="visibility:hidden"':'')+'>← Назад</button><div class="sim-prog"><i style="width:'+Math.round(n/total*100)+'%"></i></div><button class="sim-btn sim-next">'+nextLabel+'</button></div>';
  S.card.querySelector('.sim-x').onclick=stop;
  S.card.querySelector('.sim-back').onclick=back;
  S.card.querySelector('.sim-next').onclick=next;
  var sc2=window.SIM_SCENES[S.i];
  if(!sc2.sel) placeCard(null); // позиция по фактической высоте уже заполненной карточки
}

function reposition(){
  var sc=window.SIM_SCENES[S.i];
  if(sc && sc.sel && !sc.html) anchor(sc.sel); else placeCard(null);
}

// кнопка запуска
function initLaunch(){
  var b=el('button','sim-launch','<span class="gold">▶</span> '+(window.SIM_LAUNCH_LABEL||'Как это работает — симуляция'));
  b.onclick=start;
  document.body.appendChild(b);
  var m=location.search.match(/[?&]sim=(\d+)/);
  if(m) setTimeout(function(){ start(parseInt(m[1],10)-1); },400);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initLaunch); else initLaunch();

window.SIM={start:start,stop:stop};
})();
