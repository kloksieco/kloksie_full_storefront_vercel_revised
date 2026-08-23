const FALLBACK_PRODUCTS = [
  { id: "kloksie-01", name: "KLOKSIE LOW 01", description: "Black / Off-white sneaker", image: "assets/product-01.jpg", alt: "Black low-top sneaker", price: 0, stock: 0, tag: "COMING SOON", size: "", category: "Archive", active: true, sort_order: 1 },
  { id: "kloksie-02", name: "RICK OWENS", description: "Sculptural low-top sneaker", image: "assets/product-02.jpg", alt: "Rick Owens sneaker", price: 3500, stock: 1, tag: "NEW", size: "37", category: "Archive", active: true, sort_order: 2 }
];

let products = FALLBACK_PRODUCTS;
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("kloksieCart") || "[]");
const money = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]); }
function safeImage(value) { const image = String(value || "").trim(); return /^(https?:\/\/|\/|assets\/)/i.test(image) ? image : "assets/product-01.jpg"; }
function priceLabel(product) { return Number(product.price) > 0 ? money.format(product.price) : "PRICE TBD"; }
function getProduct(id) { return products.find(product => product.id === id); }
function saveCart() { localStorage.setItem("kloksieCart", JSON.stringify(cart)); renderCart(); }

function productCard(product) {
  const unavailable = !Number(product.price) || Number(product.stock) < 1;
  const label = !Number(product.price) ? "PRICE TBD" : Number(product.stock) < 1 ? "SOLD OUT" : "ADD TO BAG";
  const subline = [product.description, product.size ? `SIZE ${product.size}` : ""].filter(Boolean).join(" · ");
  return `<article class="product-card"><div class="product-image-wrap">${product.tag ? `<span class="product-tag">${escapeHtml(product.tag)}</span>` : ""}<img src="${escapeHtml(safeImage(product.image))}" alt="${escapeHtml(product.alt || product.name)}" class="product-image" loading="lazy"><button class="quick-add" data-add="${escapeHtml(product.id)}" ${unavailable ? "disabled" : ""}>${label}</button></div><div class="product-info"><div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(subline || product.category || "KLOKSIE SELECTED")}</p></div><strong>${priceLabel(product)}</strong></div></article>`;
}

function renderFilters() {
  const fixed = ["All", "Streetwear", "Y2K", "Archive", "Accessories"];
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
  const list = [...new Set([...fixed, ...categories])];
  document.getElementById("categoryFilters").innerHTML = list.map(category => `<button class="filter-button ${category === activeCategory ? "is-active" : ""}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
}

function renderProducts() {
  const selected = activeCategory === "All" ? products : products.filter(product => product.category === activeCategory);
  document.getElementById("productGrid").innerHTML = selected.map(productCard).join("");
  document.getElementById("emptyProducts").hidden = Boolean(selected.length);
  document.getElementById("productCount").textContent = `${selected.length} ${selected.length === 1 ? "PIECE" : "PIECES"}`;
  const featured = products.filter(product => product.tag === "NEW" || product.tag === "NEW DROP").slice(0, 2);
  document.getElementById("featuredProducts").innerHTML = (featured.length ? featured : products.slice(0, 2)).map(productCard).join("");
}

function setCategory(category) { activeCategory = category; renderFilters(); renderProducts(); document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" }); }

function addToCart(id) {
  const product = getProduct(id);
  if (!product || !Number(product.price)) return alert("This item does not have a price yet.");
  if (Number(product.stock) < 1) return alert("This piece has sold out.");
  const existing = cart.find(item => item.id === id);
  if (existing) { if (existing.quantity >= product.stock) return alert("Only the available stock can be added."); existing.quantity += 1; }
  else cart.push({ id: product.id, quantity: 1 });
  saveCart(); openCart();
}

function changeQuantity(id, difference) {
  const item = cart.find(entry => entry.id === id); const product = getProduct(id);
  if (!item || !product) return;
  item.quantity += difference;
  if (item.quantity < 1) cart = cart.filter(entry => entry.id !== id);
  if (item.quantity > product.stock) { item.quantity = product.stock; alert("Only the available stock can be added."); }
  saveCart();
}

function renderCart() {
  cart = cart.filter(item => getProduct(item.id) && getProduct(item.id).active !== false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0); cartCount.textContent = count;
  if (!cart.length) { cartItems.innerHTML = '<p class="empty-cart">Your bag is empty.</p>'; cartTotal.textContent = "₱0"; localStorage.setItem("kloksieCart", JSON.stringify(cart)); return; }
  cartItems.innerHTML = cart.map(item => { const product = getProduct(item.id); return `<div class="cart-row"><img src="${escapeHtml(safeImage(product.image))}" alt="${escapeHtml(product.name)}"><div><h3>${escapeHtml(product.name)}</h3><p>${priceLabel(product)}</p><div class="quantity-controls"><button data-quantity="-1" data-id="${escapeHtml(product.id)}" aria-label="Remove one">−</button><span>${item.quantity}</span><button data-quantity="1" data-id="${escapeHtml(product.id)}" aria-label="Add one">+</button></div></div><button class="remove-item" data-remove="${escapeHtml(product.id)}">REMOVE</button></div>`; }).join("");
  const total = cart.reduce((sum, item) => sum + (getProduct(item.id).price * item.quantity), 0); cartTotal.textContent = money.format(total); localStorage.setItem("kloksieCart", JSON.stringify(cart));
}

function openCart() { cartDrawer.classList.add("open"); cartDrawer.setAttribute("aria-hidden", "false"); }
function closeCart() { cartDrawer.classList.remove("open"); cartDrawer.setAttribute("aria-hidden", "true"); }

async function loadProducts() {
  try { const response = await fetch("/api/products", { headers: { Accept: "application/json" } }); const data = await response.json(); if (response.ok && Array.isArray(data.products) && data.products.length) products = data.products; }
  catch (error) { console.warn("Using storefront preview products until the catalog is connected.", error); }
  renderFilters(); renderProducts(); renderCart();
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]"); if (add) return addToCart(add.dataset.add);
  const filter = event.target.closest("[data-filter], [data-category]"); if (filter) return setCategory(filter.dataset.filter || filter.dataset.category);
  const remove = event.target.closest("[data-remove]"); if (remove) { cart = cart.filter(item => item.id !== remove.dataset.remove); return saveCart(); }
  const quantity = event.target.closest("[data-quantity]"); if (quantity) return changeQuantity(quantity.dataset.id, Number(quantity.dataset.quantity));
});
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
document.getElementById("openMenu").addEventListener("click", () => { const menu = document.getElementById("mobileNav"); const open = menu.hidden; menu.hidden = !open; document.getElementById("openMenu").setAttribute("aria-expanded", String(open)); });
document.getElementById("mobileNav").addEventListener("click", () => { document.getElementById("mobileNav").hidden = true; document.getElementById("openMenu").setAttribute("aria-expanded", "false"); });

const checkoutDialog = document.getElementById("checkoutDialog");
document.getElementById("checkoutBtn").addEventListener("click", () => { if (!cart.length) return alert("Your bag is empty."); if (cart.some(item => { const product = getProduct(item.id); return !product || !product.price || product.stock < item.quantity; })) return alert("Please update your bag before checkout."); checkoutDialog.showModal(); });
document.getElementById("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault(); if (!cart.length) return;
  const button = event.currentTarget.querySelector('button[type="submit"]'); const original = button.textContent; button.disabled = true; button.textContent = "CONNECTING TO PAYMONGO…";
  const form = new FormData(event.currentTarget); const customer = Object.fromEntries(["name", "email", "phone", "address"].map(key => [key, String(form.get(key) || "").trim()]));
  try { const response = await fetch("/api/create-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart, customer }) }); const data = await response.json(); if (!response.ok || !data.checkout_url) throw new Error(data.error || "Unable to create PayMongo checkout."); localStorage.setItem("kloksieLastOrderReference", data.reference_number || ""); window.location.assign(data.checkout_url); }
  catch (error) { alert(error.message || "Payment setup failed. Please try again."); button.disabled = false; button.textContent = original; }
});
document.getElementById("year").textContent = new Date().getFullYear();
loadProducts();
