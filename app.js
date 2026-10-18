(() => {
  'use strict';
  const KEY = 'rathoParkGolfApp_v1';
  const initial = { balancePence: 0, menu: [{id:'cappuccino-demo',name:'Cappuccino',pricePence:270,favourite:false}], order: [], history: [] };
  let state = load(); let busy = false; let toastTimer;
  const $ = id => document.getElementById(id);
  function load(){ try { const saved=JSON.parse(localStorage.getItem(KEY)); if(!saved || !Array.isArray(saved.menu)) return structuredClone(initial); return {...structuredClone(initial),...saved,order:Array.isArray(saved.order)?saved.order:[],history:Array.isArray(saved.history)?saved.history:[]}; } catch { return structuredClone(initial); } }
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
  const money = p => '£'+(p/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function total(){return state.order.reduce((sum,line)=>sum+line.pricePence*line.qty,0);}
  function showToast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);}
  function openModal(id){$(id).hidden=false;document.body.style.overflow='hidden';const first=$(id).querySelector('input');if(first)setTimeout(()=>first.focus(),100);}
  function closeModal(id){$(id).hidden=true;if(!document.querySelector('.modal-backdrop:not([hidden])'))document.body.style.overflow='';}
  function render(){
    $('balance').textContent=money(state.balancePence);
    const query=$('search').value.trim().toLowerCase(), favOnly=$('favouritesToggle').getAttribute('aria-pressed')==='true';
    const items=state.menu.filter(i=>i.name.toLowerCase().includes(query)&&(!favOnly||i.favourite));
    $('menuList').innerHTML=items.map(i=>`<div class="menu-row"><button class="menu-item-main" data-add="${escapeHtml(i.id)}" aria-label="Add ${escapeHtml(i.name)} to order"><span class="menu-item-name">${escapeHtml(i.name)}</span><span class="menu-price">${money(i.pricePence)}</span></button><button class="star-button ${i.favourite?'is-favourite':''}" data-star="${escapeHtml(i.id)}" aria-label="${i.favourite?'Remove from':'Add to'} favourites">${i.favourite?'★':'☆'}</button><button class="plus-button" data-add="${escapeHtml(i.id)}" aria-label="Add ${escapeHtml(i.name)}">＋</button></div>`).join('');
    $('menuList').style.display=items.length?'block':'none';$('emptyState').classList.toggle('show',items.length===0);$('favouritesToggle').setAttribute('aria-pressed',favOnly);$('favouritesToggle').innerHTML=`<span>${favOnly?'★':'☆'}</span> Favourites`;$('clearSearch').hidden=!query;
    $('itemCount').textContent=state.order.reduce((n,i)=>n+i.qty,0);$('orderTotal').textContent=money(total());$('doneButton').disabled=state.order.length===0||busy;
    $('orderItems').innerHTML=state.order.length?state.order.map(line=>`<div class="order-line"><span class="order-line-name">${escapeHtml(line.name)}</span><div class="qty-controls"><button data-dec="${escapeHtml(line.id)}" aria-label="Remove one ${escapeHtml(line.name)}">−</button><span>${line.qty}</span><button data-inc="${escapeHtml(line.id)}" aria-label="Add one ${escapeHtml(line.name)}">＋</button></div><span class="order-line-price">${money(line.pricePence*line.qty)}</span></div>`).join(''):'<p class="order-empty">Tap a menu item to add it here.</p>';
  }
  function addItem(id){const item=state.menu.find(i=>i.id===id);if(!item)return;const line=state.order.find(i=>i.id===id);if(line)line.qty++;else state.order.push({id:item.id,name:item.name,pricePence:item.pricePence,qty:1});save();render();showToast(item.name+' added to your order');}
  function changeQty(id,delta){const line=state.order.find(i=>i.id===id);if(!line)return;line.qty+=delta;if(line.qty<=0)state.order=state.order.filter(i=>i.id!==id);save();render();}
  function finishOrder(){if(busy)return;if(!state.order.length){showToast('Your order is empty');return;}busy=true;$('doneButton').disabled=true;
    try { const amount=total(); if(amount>state.balancePence){showToast('Not enough balance. Add money first.');return;} const transactionId=crypto.randomUUID(); const snapshot=state.order.map(i=>({...i}));
      // Single local state update: balance deduction, activity record and order clear are persisted together.
      const nextBalance=state.balancePence-amount; const nextHistory=[{id:transactionId,kind:'purchase',amountPence:amount,items:snapshot,at:new Date().toISOString()},...state.history].slice(0,100);
      const previous=state;state={...state,balancePence:nextBalance,order:[],history:nextHistory};save();render();showToast('Order complete · '+money(amount)+' deducted');
    } catch(err){showToast('Could not save checkout. Please try again.');} finally {busy=false;render();}
  }
  $('menuList').addEventListener('click',e=>{const add=e.target.closest('[data-add]'),star=e.target.closest('[data-star]');if(add)addItem(add.dataset.add);if(star){const i=state.menu.find(x=>x.id===star.dataset.star);if(i){i.favourite=!i.favourite;save();render();}}});
  $('orderItems').addEventListener('click',e=>{const inc=e.target.closest('[data-inc]'),dec=e.target.closest('[data-dec]');if(inc)changeQty(inc.dataset.inc,1);if(dec)changeQty(dec.dataset.dec,-1);});
  $('search').addEventListener('input',render);$('clearSearch').addEventListener('click',()=>{$('search').value='';render();$('search').focus();});
  $('favouritesToggle').addEventListener('click',()=>{$('favouritesToggle').setAttribute('aria-pressed',$('favouritesToggle').getAttribute('aria-pressed')!=='true');render();});$('navFavourites').addEventListener('click',()=>{$('favouritesToggle').setAttribute('aria-pressed','true');render();$('menuList').scrollIntoView({behavior:'smooth',block:'start'});});
  $('addMoneyOpen').addEventListener('click',()=>{$('moneyAmount').value='';$('moneyError').textContent='';openModal('moneyModal');});
  document.querySelectorAll('[data-amount]').forEach(b=>b.addEventListener('click',()=>{$('moneyAmount').value=b.dataset.amount;$('moneyAmount').focus();}));
  $('confirmMoney').addEventListener('click',()=>{const raw=$('moneyAmount').value.trim(),n=Number(raw);if(!raw||!Number.isFinite(n)||n<=0||!Number.isSafeInteger(Math.round(n*100))){$('moneyError').textContent='Enter a valid amount greater than £0.';return;}const p=Math.round(n*100);state.balancePence+=p;state.history.unshift({id:crypto.randomUUID(),kind:'topup',amountPence:p,at:new Date().toISOString()});state.history=state.history.slice(0,100);save();render();closeModal('moneyModal');showToast(money(p)+' added to your tracker');});
  $('settingsOpen').addEventListener('click',()=>openModal('settingsModal'));$('manageMenu').addEventListener('click',()=>{closeModal('settingsModal');$('itemName').value='';$('itemPrice').value='';$('itemError').textContent='';openModal('itemModal');});$('addFirstItem').addEventListener('click',()=>$('manageMenu').click());
  $('saveItem').addEventListener('click',()=>{const name=$('itemName').value.trim(),raw=$('itemPrice').value.trim(),n=Number(raw);if(!name){$('itemError').textContent='Enter an item name.';return;}if(!raw||!Number.isFinite(n)||n<=0){$('itemError').textContent='Enter a valid price greater than £0.';return;}state.menu.push({id:crypto.randomUUID(),name,pricePence:Math.round(n*100),favourite:false});save();closeModal('itemModal');render();showToast(name+' added to the menu');});
  $('clearOrder').addEventListener('click',()=>{if(!state.order.length)return;state.order=[];save();render();showToast('Order cleared');});$('doneButton').addEventListener('click',finishOrder);
  $('navHistory').addEventListener('click',()=>{const list=$('historyList');list.innerHTML=state.history.length?state.history.map(h=>`<div class="history-entry"><div><strong>${h.kind==='topup'?'Money added':'Order completed'}</strong><br><span>${new Date(h.at).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'})}${h.items?' · '+h.items.map(i=>`${i.qty}× ${escapeHtml(i.name)}`).join(', '):''}</span></div><strong>${h.kind==='topup'?'+':'−'}${money(h.amountPence)}</strong></div>`).join(''):'<p class="muted">No activity yet.</p>';openModal('historyModal');});
  $('exportData').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ratho-golf-backup.json';a.click();URL.revokeObjectURL(url);showToast('Backup exported');});
  $('resetData').addEventListener('click',()=>{if(confirm('Reset the app? This clears your balance, menu, favourites, order and activity.')){state={balancePence:0,menu:[],order:[],history:[]};save();render();closeModal('settingsModal');showToast('App data reset');}});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));document.querySelectorAll('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id);}));document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(m=>closeModal(m.id));});
  if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  render();
})();
