const { PRODUCT_FIELDS, json, parseBody, normalizeProduct, verifyAdmin, supabaseRequest } = require("../_lib");
function selectPath() { return `products?select=${encodeURIComponent(PRODUCT_FIELDS)}&order=sort_order.asc,created_at.desc`; }
module.exports = async (req, res) => {
  if (!verifyAdmin(req)) return json(res, 401, { error: "Please sign in again." });
  try {
    if (req.method === "GET") { const products = await supabaseRequest(selectPath()); return json(res, 200, { products: Array.isArray(products) ? products : [] }); }
    const body = parseBody(req);
    if (req.method === "POST") { const product = normalizeProduct(body); const created = await supabaseRequest("products", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(product) }); return json(res, 201, { product: Array.isArray(created) ? created[0] : created }); }
    if (req.method === "PUT") { const product = normalizeProduct(body, { requireId: true }); const updated = await supabaseRequest(`products?id=eq.${encodeURIComponent(product.id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(product) }); if (!Array.isArray(updated) || !updated[0]) return json(res, 404, { error: "Product not found." }); return json(res, 200, { product: updated[0] }); }
    return json(res, 405, { error: "Method not allowed." });
  } catch (error) { return json(res, error.status === 409 ? 409 : 400, { error: error.message || "Unable to save product." }); }
};
