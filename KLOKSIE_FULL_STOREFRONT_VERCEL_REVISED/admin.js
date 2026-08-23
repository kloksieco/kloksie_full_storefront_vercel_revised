let token = sessionStorage.getItem("kloksieAdminToken") || "";
let products = [];
const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginMessage = document.getElementById("loginMessage");
const dashboardMessage = document.getElementById("dashboardMessage");
const form = document.getElementById("productForm");
const productList = document.getElementById("productList");

function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]); }
function showMessage(element, message, success = false) { element.textContent = message || ""; element.classList.toggle("success", Boolean(success)); }
function image(value) { return /^(https?:\/\/|\/|assets\/)/i.test(String(value || "")) ? value : "assets/product-01.jpg"; }
function headers() { return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }; }

async function request(url, options = {}) {
  const response = await fetch(url, options); const data = await response.json().catch(() => ({}));
  if (response.status === 401) signOut();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function productValues(product) {
  for (const [key, value] of Object.entries(product)) { const field = form.elements.namedItem(key); if (!field) continue; if (field.type === "checkbox") field.checked = Boolean(value); else field.value = value ?? ""; }
}
function newProduct() { form.reset(); form.elements.active.checked = true; form.elements.sort_order.value = "0"; form.elements.id.value = ""; document.getElementById("formTitle").textContent = "Add a product"; document.getElementById("resetForm").hidden = true; showMessage(dashboardMessage, ""); }
function editProduct(id) { const product = products.find(item => item.id === id); if (!product) return; productValues(product); document.getElementById("formTitle").textContent = "Edit product"; document.getElementById("resetForm").hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); }

function renderProducts() {
  document.getElementById("inventoryCount").textContent = `${products.length} ${products.length === 1 ? "ITEM" : "ITEMS"}`;
  if (!products.length) { productList.innerHTML = '<p class="empty">No products yet. Add your first piece here.</p>'; return; }
  productList.innerHTML = products.map(product => `<article class="inventory-row"><img src="${escapeHtml(image(product.image))}" alt=""><div><h3>${escapeHtml(product.name)}</h3><p>₱${Number(product.price || 0).toLocaleString("en-PH")} · ${Number(product.stock || 0)} in stock</p><p class="meta">${escapeHtml(product.category || "Archive")}${product.size ? ` · SIZE ${escapeHtml(product.size)}` : ""}${product.active ? "" : " · HIDDEN"}</p></div><div class="row-actions"><button data-edit="${escapeHtml(product.id)}">EDIT</button><button data-hide="${escapeHtml(product.id)}">${product.active ? "HIDE" : "SHOW"}</button></div></article>`).join("");
}

async function loadProducts() { const data = await request("/api/admin/products", { headers: headers() }); products = data.products || []; renderProducts(); }
async function openDashboard() { loginPanel.hidden = true; dashboard.hidden = false; try { await loadProducts(); } catch (error) { showMessage(dashboardMessage, error.message); } }
function signOut() { token = ""; sessionStorage.removeItem("kloksieAdminToken"); dashboard.hidden = true; loginPanel.hidden = false; newProduct(); }

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault(); const button = event.currentTarget.querySelector("button"); button.disabled = true; showMessage(loginMessage, "");
  try { const password = new FormData(event.currentTarget).get("password"); const data = await request("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); token = data.token; sessionStorage.setItem("kloksieAdminToken", token); event.currentTarget.reset(); await openDashboard(); }
  catch (error) { showMessage(loginMessage, error.message); } finally { button.disabled = false; }
});
form.addEventListener("submit", async event => {
  event.preventDefault(); const data = Object.fromEntries(new FormData(form)); data.active = form.elements.active.checked; data.price = Number(data.price); data.stock = Number(data.stock); data.sort_order = Number(data.sort_order); const editing = Boolean(data.id); const button = form.querySelector(".save-product"); button.disabled = true; showMessage(dashboardMessage, "");
  try { await request("/api/admin/products", { method: editing ? "PUT" : "POST", headers: headers(), body: JSON.stringify(data) }); newProduct(); showMessage(dashboardMessage, editing ? "Product updated." : "Product added.", true); await loadProducts(); }
  catch (error) { showMessage(dashboardMessage, error.message); } finally { button.disabled = false; }
});
productList.addEventListener("click", async event => {
  const edit = event.target.closest("[data-edit]"); if (edit) return editProduct(edit.dataset.edit);
  const hide = event.target.closest("[data-hide]"); if (!hide) return; const product = products.find(item => item.id === hide.dataset.hide); if (!product) return; showMessage(dashboardMessage, "");
  try { await request("/api/admin/products", { method: "PUT", headers: headers(), body: JSON.stringify({ ...product, active: !product.active }) }); showMessage(dashboardMessage, product.active ? "Product hidden from the store." : "Product is visible in the store.", true); await loadProducts(); }
  catch (error) { showMessage(dashboardMessage, error.message); }
});
document.getElementById("resetForm").addEventListener("click", newProduct);
document.getElementById("signOut").addEventListener("click", signOut);
if (token) openDashboard();
