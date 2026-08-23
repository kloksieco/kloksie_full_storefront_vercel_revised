const { PRODUCT_FIELDS, json, parseBody, normalizeProduct, verifyAdmin, supabaseRequest } = require("../_lib");
function selectPath() { return `products?select=${encodeURIComponent(PRODUCT_FIELDS)}&order=sort_order.asc,created_at.desc`; }
async function hydrate(product) {
  const [images, variants] = await Promise.all([
    supabaseRequest(`product_images?select=id,product_id,image_url,sort_order,is_featured&product_id=eq.${encodeURIComponent(product.id)}&order=sort_order.asc`),
    supabaseRequest(`product_variants?select=id,product_id,color,size,stock&product_id=eq.${encodeURIComponent(product.id)}&order=color.asc,size.asc`)
  ]);
  return { ...product, images: images || [], variants: variants || [] };
}
async function saveChildren(productId, images, variants) {
  await supabaseRequest(`product_images?product_id=eq.${encodeURIComponent(productId)}`, { method: "DELETE" });
  await supabaseRequest(`product_variants?product_id=eq.${encodeURIComponent(productId)}`, { method: "DELETE" });
  if (images.length) await supabaseRequest("product_images", { method: "POST", body: JSON.stringify(images.map((item, i) => ({ product_id: productId, image_url: item.image_url, sort_order: i, is_featured: Boolean(item.is_featured) }))) });
  if (variants.length) await supabaseRequest("product_variants", { method: "POST", body: JSON.stringify(variants.map(item => ({ product_id: productId, color: item.color || "", size: item.size || "", stock: item.stock }))) });
}
module.exports = async (req, res) => {
  if (!verifyAdmin(req)) return json(res, 401, { error: "Please sign in again." });
  try {
    if (req.method === "GET") {
      const products = await supabaseRequest(selectPath());
      const result = await Promise.all((Array.isArray(products) ? products : []).map(hydrate));
      return json(res, 200, { products: result });
    }
    const body = parseBody(req);
    if (req.method === "POST") {
      const product = normalizeProduct(body);
      const { images, variants, ...base } = product;
      if (!base.image && !images.length) throw new Error("At least one product image is required.");
      const created = await supabaseRequest("products", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(base) });
      const saved = Array.isArray(created) ? created[0] : created;
      await saveChildren(saved.id, images.length ? images : [{ image_url: saved.image, is_featured: true, sort_order: 0 }], variants);
      return json(res, 201, { product: await hydrate(saved) });
    }
    if (req.method === "PUT") {
      const product = normalizeProduct(body, { requireId: true });
      const { images, variants, ...base } = product;
      if (!base.image && !images.length) throw new Error("At least one product image is required.");
      const updated = await supabaseRequest(`products?id=eq.${encodeURIComponent(product.id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(base) });
      if (!Array.isArray(updated) || !updated[0]) return json(res, 404, { error: "Product not found." });
      await saveChildren(product.id, images, variants);
      return json(res, 200, { product: await hydrate(updated[0]) });
    }
    return json(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("Admin products error:", error);
    return json(res, error.status === 409 ? 409 : 500, { error: error.message || "Unable to load products. Please check the Supabase schema." });
  }
};
