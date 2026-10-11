(function () {
  // Shared header and footer, so each page only needs the markup once.
  const pages = [
    ["index.html", "Home"], ["shop.html", "Shop"], ["about.html", "About"],
    ["services.html", "Services"], ["blog.html", "Blog"], ["faq.html", "FAQ"], ["contact.html", "Contact"]
  ];
  const here = location.pathname.split("/").pop() || "index.html";

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <header class="site"><nav class="nav">
        <a class="logo" href="index.html">Starter Store</a>
        <button class="menu-btn" aria-label="Menu" id="menuBtn">☰</button>
        <ul class="links" id="links">
          ${pages.map(([href, label]) =>
            `<li><a href="${href}" class="${href === here ? "active" : ""}">${label}</a></li>`).join("")}
        </ul>
      </nav></header>`;
    document.getElementById("menuBtn").addEventListener("click", () =>
      document.getElementById("links").classList.toggle("open"));
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <footer class="site"><div class="wrap">
        <div class="fgrid">
          <div><h4>Starter Store</h4><p>Everyday goods, made simply. Demo site, no real orders are processed.</p></div>
          <div><h4>Explore</h4>${pages.slice(0, 4).map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</div>
          <div><h4>Help</h4>${pages.slice(4).map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</div>
        </div>
        <div class="copy">© <span id="yr"></span> Starter Store. All rights reserved.</div>
      </div></footer>`;
    document.getElementById("yr").textContent = new Date().getFullYear();
  }

  // Scroll reveal for anything marked .reveal
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("in"));
  }

  // Simple form handlers (demo only, nothing is sent)
  document.querySelectorAll("form[data-demo]").forEach(f => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = f.parentElement.querySelector(".notice");
      if (n) { n.textContent = f.dataset.demo; n.style.display = "block"; }
      f.reset();
    });
  });
})();

// ===== Hero v2 interactions =====
(function () {
  const words = ["special", "useful", "beautiful", "yours"];
  const el = document.getElementById("rotator");
  if (el) {
    let i = 0;
    setInterval(() => {
      el.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove("out");
      }, 350);
    }, 2400);
  }

  const stage = document.getElementById("stage");
  const products = document.querySelectorAll(".hero-product");
  const spotName = document.getElementById("spotName");
  const spotPrice = document.getElementById("spotPrice");
  function pick(btn) {
    products.forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    spotName.textContent = btn.dataset.name;
    spotPrice.textContent = btn.dataset.price;
  }
  products.forEach(p => p.addEventListener("click", () => pick(p)));

  })();

// ===== Shared cart (works on every page) =====
(function () {
  const PRODUCTS = {
    1: { name: "Ceramic Mug", price: 18, emoji: "☕" },
    2: { name: "Linen Tote", price: 32, emoji: "👜" },
    3: { name: "Desk Plant", price: 24, emoji: "🪴" },
    4: { name: "Canvas Sneakers", price: 58, emoji: "👟" },
    5: { name: "Wool Beanie", price: 22, emoji: "🧢" },
    6: { name: "Notebook Set", price: 14, emoji: "📓" }
  };
  const KEY = "starter-store-cart";
  const money = n => "$" + n.toFixed(2);
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };

  // Cart button in header
  const nav = document.querySelector("header.site .nav");
  if (nav) {
    const b = document.createElement("button");
    b.id = "cartBtn"; b.className = "btn dark cart-toggle";
    b.innerHTML = 'Cart <span id="cartCount">0</span>';
    nav.appendChild(b);
  }

  // Drawer + overlay
  document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-overlay" id="cartOverlay"></div>
    <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping cart">
      <div class="cart-head"><h3>Your cart</h3><button id="cartClose" aria-label="Close">×</button></div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-foot">
        <div class="cart-total"><span>Total</span><strong id="cartTotal">$0.00</strong></div>
        <button class="btn" id="cartCheckout" style="width:100%">Checkout</button>
        <p class="cart-msg" id="cartMsg"></p>
      </div>
    </aside>`);

  const $ = id => document.getElementById(id);

  function render() {
    const ids = Object.keys(cart).filter(id => cart[id] > 0);
    const count = ids.reduce((s, id) => s + cart[id], 0);
    const total = ids.reduce((s, id) => s + PRODUCTS[id].price * cart[id], 0);
    if ($("cartCount")) $("cartCount").textContent = count;
    $("cartTotal").textContent = money(total);
    $("cartCheckout").disabled = count === 0;
    $("cartItems").innerHTML = ids.length ? ids.map(id => {
      const p = PRODUCTS[id];
      return `<div class="cart-line">
        <div class="cart-emo">${p.emoji}</div>
        <div class="cart-meta"><strong>${p.name}</strong><small>${money(p.price)} each</small>
          <div class="cart-qty">
            <button data-dec="${id}" aria-label="Decrease">−</button><span>${cart[id]}</span>
            <button data-inc="${id}" aria-label="Increase">+</button>
            <button class="cart-remove" data-rm="${id}">Remove</button>
          </div></div>
        <strong>${money(p.price * cart[id])}</strong></div>`;
    }).join("") : '<p class="cart-empty">Your cart is empty. Browse the shop to add items.</p>';
  }

  function change(id, d) {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    save(); render();
  }
  function open() { $("cartDrawer").classList.add("open"); $("cartOverlay").classList.add("open"); }
  function close() { $("cartDrawer").classList.remove("open"); $("cartOverlay").classList.remove("open"); }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.dataset.add;
      change(id, 1);
      const old = add.textContent;
      add.textContent = "Added ✓";
      setTimeout(() => add.textContent = old, 900);
      return;
    }
    if (e.target.closest("#cartBtn")) return open();
    if (e.target.id === "cartClose" || e.target.id === "cartOverlay") return close();
    const t = e.target;
    if (t.dataset.inc) change(t.dataset.inc, 1);
    else if (t.dataset.dec) change(t.dataset.dec, -1);
    else if (t.dataset.rm) { delete cart[t.dataset.rm]; save(); render(); }
  });

  $("cartCheckout").addEventListener("click", () => {
    $("cartMsg").textContent = "Demo only: connect a payment provider (e.g. Stripe) to take real orders.";
  });

  render();
  window.StarterCart = { add: (id) => change(String(id), 1) };
})();
