const { PRODUCT_FIELDS, json, hasSupabase, supabaseRequest } = require("./_lib");
const preview = [
  { id: "kloksie-01", name: "KLOKSIE LOW 01", description: "Black / Off-white sneaker", image: "assets/product-01.jpg", alt: "Black low-top sneaker", price: 0, stock: 0, tag: "COMING SOON", size: "", category: "Archive", active: true, sort_order: 1, images: [{ image_url: "assets/product-01.jpg", sort_order: 0, is_featured: true }], variants: [] },
  { id: "kloksie-02", name: "RICK OWENS", description: "Sculptural low-top sneaker", image: "assets/product-02.jpg", alt: "Rick Owens sneaker", price: 3500, stock: 1, tag: "NEW", size: "37", category: "Archive", active: true, sort_order: 2, images: [{ image_url: "assets/product-02.jpg", sort_order: 0, is_featured: true }], variants: [{ color: "Black", size: "37", stock: 1 }] }
];
module.exports = async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 200, { products: preview, configured: false });
  try {
    const products = await supabaseRequest(`products?select=${encodeURIComponent(PRODUCT_FIELDS)}&active=eq.true&order=sort_order.asc,created_at.desc`);
    const ids = (products || []).map(p => p.id);
    if (!ids.length) return json(res, 200, { products: [], configured: true });
    const [images, variants] = await Promise.all([
      supabaseRequest(`product_images?select=id,product_id,image_url,sort_order,is_featured&product_id=in.(${ids.join(",")})&order=sort_order.asc`),
      supabaseRequest(`product_variants?select=id,product_id,color,size,stock&product_id=in.(${ids.join(",")})&order=color.asc,size.asc`)
    ]);
    const imageMap = new Map(), variantMap = new Map();
    (images || []).forEach(row => { if (!imageMap.has(row.product_id)) imageMap.set(row.product_id, []); imageMap.get(row.product_id).push(row); });
    (variants || []).forEach(row => { if (!variantMap.has(row.product_id)) variantMap.set(row.product_id, []); variantMap.get(row.product_id).push(row); });
    const result = (products || []).map(product => ({ ...product, images: imageMap.get(product.id) || (product.image ? [{ image_url: product.image, sort_order: 0, is_featured: true }] : []), variants: variantMap.get(product.id) || [] }));
    return json(res, 200, { products: result, configured: true });
  } catch (error) { console.error(error); return json(res, 502, { error: "The catalog could not be loaded.", products: [] }); }
};
