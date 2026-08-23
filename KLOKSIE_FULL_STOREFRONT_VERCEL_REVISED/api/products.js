const { PRODUCT_FIELDS, json, hasSupabase, supabaseRequest } = require("./_lib");
const preview = [
  { id: "kloksie-01", name: "KLOKSIE LOW 01", description: "Black / Off-white sneaker", image: "assets/product-01.jpg", alt: "Black low-top sneaker", price: 0, stock: 0, tag: "COMING SOON", size: "", category: "Archive", active: true, sort_order: 1 },
  { id: "kloksie-02", name: "RICK OWENS", description: "Sculptural low-top sneaker", image: "assets/product-02.jpg", alt: "Rick Owens sneaker", price: 3500, stock: 1, tag: "NEW", size: "37", category: "Archive", active: true, sort_order: 2 }
];
module.exports = async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 200, { products: preview, configured: false });
  try { const products = await supabaseRequest(`products?select=${encodeURIComponent(PRODUCT_FIELDS)}&active=eq.true&order=sort_order.asc,created_at.desc`); return json(res, 200, { products: Array.isArray(products) ? products : [], configured: true }); }
  catch { return json(res, 502, { error: "The catalog could not be loaded.", products: [] }); }
};
