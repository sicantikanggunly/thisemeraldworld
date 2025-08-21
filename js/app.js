
const products = [
  {id:1, name:"Aurora Gown", price:12500000, image:"assets/img/download (31).jpg", bestseller:true},
  {id:2, name:"Céleste Pearl Dress", price:13900000, image:"assets/img/download (25).jpg", bestseller:true},
  {id:3, name:"Regalia Silver", price:15800000, image:"assets/img/download (29).jpg", bestseller:true},
  {id:4, name:"Opaline Blossom", price:9900000, image:"assets/img/download (28).jpg", bestseller:false},
  {id:5, name:"Champagne Petals", price:12000000, image:"assets/img/82f79ff4-f6a8-4114-9cb0-5197f398da2d.png", bestseller:true},
  {id:6, name:"Rose Dusk", price:10800000, image:"assets/img/download (27).jpg", bestseller:true},
  {id:7, name:"Gilded Grace", price:14900000, image:"assets/img/download (26).jpg", bestseller:true},
  {id:8, name:"Blush Symphony", price:9800000, image:"assets/img/download (32).jpg", bestseller:false},
];

const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(n);
const el = s => document.querySelector(s);
const grid = el('#productGrid');
const slidesEl = el('#slides');
const cartCount = el('#cartCount');
const yearEl = el('#year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
const toast = el('#toast');

const CART_KEY = 'ewlux-cart';
const TESTI_KEY = 'ewlux-testimonials';
const FEEDBACK_KEY = 'ewlux-feedback';

const read = (k, f=[]) => { try{ return JSON.parse(localStorage.getItem(k)) ?? f }catch{return f} };
const write = (k,v) => localStorage.setItem(k, JSON.stringify(v));

function showToast(msg='Ditambahkan ke keranjang'){
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 1300);
}

function renderProducts(){
  if(!grid) return;
  grid.innerHTML = products.map(p => `
  <div class="card">
    <img src="${p.image}" alt="${p.name}"/>
    <div class="title">${p.name}</div>
    <div class="price">${rupiah(p.price)}</div>
    <div class="actions" style="display:flex;gap:.5rem">
      <button class="btn add" data-id="${p.id}">+ Keranjang</button>
      <a href="pages/checkout.html" class="btn secondary">Checkout</a>
    </div>
  </div>`).join('');
  grid.querySelectorAll('.add').forEach(b => b.addEventListener('click', onAdd));
}

function onAdd(e){
  const id = Number(e.currentTarget.dataset.id);
  const cart = read(CART_KEY, []);
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty += 1; else cart.push({id, qty:1});
  write(CART_KEY, cart);
  updateCartCount();
  showToast();
}

function updateCartCount(){
  if(!cartCount) return;
  const c = read(CART_KEY, []);
  cartCount.textContent = c.reduce((a,b)=>a+b.qty,0);
}

function renderSlider(){
  if(!slidesEl) return;
  const best = products.filter(p=>p.bestseller).slice(0,10);
  slidesEl.innerHTML = best.map(p => `
    <div class="slide">
      <img src="${p.image}" alt="${p.name}"/>
      <div class="info">
        <h3>${p.name}</h3>
        <div class="price">${rupiah(p.price)}</div>
        <div class="actions">
          <button class="btn add" data-id="${p.id}">+ Keranjang</button>
          <a class="btn secondary" href="pages/checkout.html">Checkout</a>
        </div>
      </div>
    </div>`).join('');
  let idx = 0;
  const update = ()=> slidesEl.style.transform = `translateX(${-idx*100}%)`;
  el('#prevSlide')?.addEventListener('click', ()=>{ idx = (idx-1+best.length)%best.length; update(); });
  el('#nextSlide')?.addEventListener('click', ()=>{ idx = (idx+1)%best.length; update(); });
  slidesEl.querySelectorAll('.add').forEach(b => b.addEventListener('click', onAdd));
}

// testimonials
function renderTestimonials(){
  const container = el('#testimonialList');
  if(!container) return;
  const seed = [
    {nama:"Alya", ulasan:"Gaunnya memukau, detail payetnya halus sekali!"},
    {nama:"Nadya", ulasan:"Pelayanan butik ramah, pengukuran pas di badan."},
    {nama:"Saskia", ulasan:"Warna champagne-nya elegan, looks so expensive."},
  ];
  const user = read(TESTI_KEY, []);
  const list = [...seed, ...user];
  container.innerHTML = list.map(t => `
    <div class="card">
      <img src="assets/svg/star.svg" alt="star" style="width:40px;height:40px"/>
      <div class="title">${t.nama}</div>
      <p style="font-family:ui-sans-serif">${t.ulasan}</p>
    </div>`).join('');
}

function wireForms(){
  const testiForm = el('#testimonialForm');
  testiForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(testiForm);
    const item = {nama: fd.get('nama'), ulasan: fd.get('ulasan')};
    const now = read(TESTI_KEY, []); now.push(item); write(TESTI_KEY, now);
    testiForm.reset();
    renderTestimonials();
    alert('Terima kasih untuk testimoninya!');
  });
  const fbForm = el('#feedbackForm');
  fbForm?.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(fbForm);
    const item = {email: fd.get('email')||null, pesan: fd.get('pesan'), at: new Date().toISOString()};
    const now = read(FEEDBACK_KEY, []); now.push(item); write(FEEDBACK_KEY, now);
    fbForm.reset();
    alert('Masukan terkirim. Terima kasih!');
  });
}

// checkout
function renderCheckout(){
  const container = el('#cartItems');
  if(!container) return;
  const cart = read(CART_KEY, []);
  if(cart.length===0){
    container.innerHTML = '<p>Keranjang kosong.</p>';
  }else{
    container.innerHTML = cart.map(row => {
      const p = products.find(x=>x.id===row.id);
      return `<div class="card">
        <img src="${p.image}" alt="${p.name}"/>
        <div class="title">${p.name}</div>
        <div style="display:flex;gap:.4rem;align-items:center">
          <button class="btn secondary qty" data-id="${row.id}" data-delta="-1">-</button>
          <span>Qty: ${row.qty}</span>
          <button class="btn secondary qty" data-id="${row.id}" data-delta="1">+</button>
          <button class="btn" style="background:#6b4b00;color:#fff" data-remove="${row.id}">Hapus</button>
        </div>
        <div class="price">${rupiah(p.price*row.qty)}</div>
      </div>`;
    }).join('');
    container.querySelectorAll('.qty').forEach(b => b.addEventListener('click', e=>{
      const id = Number(e.currentTarget.dataset.id);
      const delta = Number(e.currentTarget.dataset.delta);
      const c = read(CART_KEY, []);
      const it = c.find(x=>x.id===id);
      if(!it) return;
      it.qty += delta;
      if(it.qty<=0) c.splice(c.indexOf(it),1);
      write(CART_KEY, c);
      updateCartCount();
      renderCheckout();
    }));
    container.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', e=>{
      const id = Number(e.currentTarget.dataset.remove);
      const c = read(CART_KEY, []).filter(x=>x.id!==id);
      write(CART_KEY, c);
      updateCartCount();
      renderCheckout();
    }));
  }
  const total = cart.reduce((acc, r)=>{
    const p = products.find(x=>x.id===r.id);
    return acc + (p?.price||0)*r.qty;
  },0);
  const totalEl = el('#cartTotal'); if(totalEl) totalEl.textContent = `Total: ${rupiah(total)}`;
  el('#placeOrder')?.addEventListener('click', ()=>{
    write(CART_KEY, []); updateCartCount(); renderCheckout();
    alert('Pesanan diterima! (Demo)');
  });
}

const openCartBtn = el('#openCart');
openCartBtn?.addEventListener('click', ()=> location.href = 'pages/checkout.html');

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();
  renderSlider();
  renderTestimonials();
  wireForms();
  renderCheckout();
  updateCartCount();
});
