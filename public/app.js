// Reveal on scroll
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('vis'); }),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Lucky number of the day
const today = new Date(); const lucky = (today.getDate()+today.getMonth()+1+today.getFullYear())%9||9;
const ls = document.getElementById('luckyStrip');
if (ls) ls.innerHTML = `Lucky Number <b style="font-size:20px">${lucky}</b> ✨`;

// Numerology calc
function reduce(n){ while(n>9 && n!==11 && n!==22){ n=String(n).split('').reduce((a,d)=>a+ +d,0);} return n; }
const GRAH={1:'Surya (सूर्य) — Leadership, sarkari kaam me safalta',2:'Chandra (चंद्र) — Mann ki shanti, parivar sukh',3:'Guru (गुरु) — Gyaan, guru-kripa, padhai me safalta',4:'Rahu (राहु) — Mehnat ka fal, videsh yog',5:'Budh (बुध) — Business, communication, dhan labh',6:'Shukra (शुक्र) — Luxury, prem, kala me safalta',7:'Ketu (केतु) — Adhyatm, research, videsh',8:'Shani (शनि) — Karma, dheere par pakka dhan',9:'Mangal (मंगल) — Energy, property, himmat',11:'Master 11 — Spiritual leader, intuition power',22:'Master 22 — Bade sapne, bada empire'};
const CHAL={A:1,I:1,J:1,Q:1,Y:1,B:2,K:2,R:2,C:3,G:3,L:3,S:3,D:4,M:4,T:4,E:5,H:5,N:5,X:5,U:6,V:6,W:6,O:7,Z:7,F:8,P:8};

function calculate(){
  const name=document.getElementById('cName').value.trim();
  const dob=document.getElementById('cDob').value;
  const box=document.getElementById('calcResult');
  if(!dob){ box.classList.remove('hidden'); box.innerHTML='⚠ Pehle birth date chunein!'; return; }
  const [y,m,d]=dob.split('-').map(Number);
  const mulank=reduce(d);
  const bhagyank=reduce(d+m+y);
  let naamank='—';
  if(name){ const s=name.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((a,c)=>a+(CHAL[c]||0),0); if(s>0) naamank=reduce(s); }
  box.classList.remove('hidden');
  box.innerHTML=`🙏 <b>${name||'Aap'}</b> ji, aapka ank:<br>🔢 <b>Mulank (मूलांक): ${mulank}</b> — ${GRAH[mulank]}<br>🌟 <b>Bhagyank (भाग्यांक): ${bhagyank}</b> — ${GRAH[bhagyank]}<br>✍️ <b>Naamank: ${naamank}</b><br><br>💛 Detail remedy ke liye <a href="#booking" style="color:#8A6508;font-weight:700">booking karein</a> ya <a href="https://wa.me/917830251510" style="color:#8A6508;font-weight:700">WhatsApp</a> karein.`;
  // update hero dashboard mockup too
  const dm=document.getElementById('dashMul'), db=document.getElementById('dashBha'), dn=document.getElementById('dashNam'), dnm=document.getElementById('dashName');
  if(dm) dm.textContent='ank '+mulank; if(db) db.textContent='ank '+bhagyank; if(dn) dn.textContent='ank '+naamank;
  if(dnm) dnm.textContent=(name||'Aapka')+' — Ank Chart';
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function bookService(s){
  const sel=document.getElementById('serviceSelect');
  [...sel.options].forEach(o=>{ if(o.text.startsWith(s)) sel.value=o.text; });
  document.getElementById('booking').scrollIntoView({behavior:'smooth'});
}

// Reviews
fetch('/api/testimonials').then(r=>r.json()).then(list=>{
  document.getElementById('revGrid').innerHTML=list.map(t=>
    `<div class="rev"><div class="stars">${'★'.repeat(t.rating||5)}</div>"${t.text}"<b>— ${t.name}</b></div>`).join('');
}).catch(()=>{
  document.getElementById('revGrid').innerHTML='<div class="rev">Reviews jald aa rahe hain...</div>';
});

// Booking submit
document.getElementById('bookForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const msg=document.getElementById('bookMsg');
  const data=Object.fromEntries(new FormData(e.target).entries());
  msg.className='book-msg'; msg.textContent='Bheja ja raha hai... ⏳';
  try{
    const r=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const j=await r.json();
    if(!r.ok) throw new Error(j.error||'Error');
    msg.className='book-msg ok'; msg.textContent='✅ Booking mil gayi! Vimesh ji jald WhatsApp par confirm karengi. 🙏';
    e.target.reset();
  }catch(err){ msg.className='book-msg err'; msg.textContent='❌ '+err.message; }
});

/* ═══════════ PRODUCT SLIDER (auto + swipe + dots) ═══════════ */
(function(){
  const slider = document.getElementById('slider');
  const track  = document.getElementById('slides');
  if(!slider || !track) return;

  const total  = track.children.length;
  const dotsEl = document.getElementById('slDots');
  const progEl = document.getElementById('slProg');
  const DELAY  = 5000;
  let idx = 0, timer = null, startX = 0, dragging = false;

  if(dotsEl){
    dotsEl.innerHTML = Array.from({length: total}, (_, i) =>
      `<button class="${i===0?'on':''}" aria-label="Slide ${i+1}" onclick="slideTo(${i})"></button>`).join('');
  }

  function render(){
    track.style.transform = `translateX(-${idx*100}%)`;
    if(dotsEl) [...dotsEl.children].forEach((d,i)=> d.classList.toggle('on', i===idx));
    restartProgress();
  }
  function restartProgress(){
    if(!progEl) return;
    progEl.style.transition = 'none';
    progEl.style.width = '0%';
    void progEl.offsetWidth;
    progEl.style.transition = `width ${DELAY}ms linear`;
    progEl.style.width = '100%';
  }
  function go(n){ idx = (n + total) % total; render(); }
  window.slideTo = go;
  window.slideGo = n => { go(idx + n); reset(); };
  function reset(){ clearInterval(timer); timer = setInterval(()=>go(idx+1), DELAY); }

  // pause on hover (desktop only)
  slider.addEventListener('mouseenter', ()=> clearInterval(timer));
  slider.addEventListener('mouseleave', reset);

  // touch swipe
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; clearInterval(timer); }, {passive:true});
  slider.addEventListener('touchmove',  e => {
    if(!dragging) return;
    const dx = e.touches[0].clientX - startX;
    if(Math.abs(dx) > 55){ go(idx + (dx < 0 ? 1 : -1)); dragging = false; }
  }, {passive:true});
  slider.addEventListener('touchend', ()=>{ dragging = false; reset(); }, {passive:true});

  // keyboard
  document.addEventListener('keydown', e=>{
    if(e.key==='ArrowLeft')  window.slideGo(-1);
    if(e.key==='ArrowRight') window.slideGo(1);
  });

  // only run while visible
  new IntersectionObserver(entries=>{
    entries.forEach(en => en.isIntersecting ? reset() : clearInterval(timer));
  }, {threshold:.15}).observe(slider);

  render();
})();

