const { json, parseBody, text, hasSupabase, hasPayMongo, supabaseRequest, siteUrl } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 503, { error: "The store catalog has not been connected yet." });
  if (!hasPayMongo()) return json(res, 503, { error: "PayMongo checkout has not been configured yet." });
  try {
    const body = parseBody(req); const items = Array.isArray(body.items) ? body.items : []; const customer = body.customer || {};
    if (!items.length || items.length > 20) return json(res, 400, { error: "Your bag is empty or invalid." });
    const requested = new Map();
    for (const item of items) { const id = text(item.id, 80); const quantity = Number(item.quantity); if (!/^[a-z0-9-]+$/.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return json(res, 400, { error: "Invalid cart item." }); requested.set(id, (requested.get(id) || 0) + quantity); }
    const ids = [...requested.keys()]; const rows = await supabaseRequest(`products?select=id,name,description,price,stock,active&id=in.(${ids.join(",")})`);
    if (!Array.isArray(rows) || rows.length !== ids.length) return json(res, 400, { error: "One or more pieces are no longer available." });
    const current = new Map(rows.map(product => [product.id, product])); const lineItems = []; const orderItems = []; let totalPhp = 0;
    for (const [id, quantity] of requested.entries()) {
      const product = current.get(id);
      if (!product || !product.active || !Number.isInteger(product.price) || product.price < 1 || !Number.isInteger(product.stock) || product.stock < quantity) return json(res, 400, { error: `${product ? product.name : "A piece"} is no longer available in the requested quantity.` });
      totalPhp += product.price * quantity; lineItems.push({ name: product.name, description: product.description || undefined, amount: product.price * 100, currency: "PHP", quantity }); orderItems.push({ id: product.id, name: product.name, price: product.price, quantity });
    }
    const reference = `KLOKSIE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; const origin = siteUrl(req);
    const payload = { data: { attributes: { line_items: lineItems, payment_method_types: ["card", "gcash", "paymaya", "qrph"], success_url: `${origin}/success.html?reference=${encodeURIComponent(reference)}`, cancel_url: `${origin}/#shop`, reference_number: reference, description: `KLOKSIE order ${reference}`, billing: { name: text(customer.name, 120), email: text(customer.email, 160), phone: text(customer.phone, 40), address: { line1: text(customer.address, 200), country: "PH" } } } } };
    const authorization = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64");
    const response = await fetch("https://api.paymongo.com/v2/checkout_sessions", { method: "POST", headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json();
    if (!response.ok || !data?.data?.attributes?.checkout_url) { console.error("PayMongo checkout error", data); return json(res, 502, { error: "PayMongo could not create the checkout session." }); }
    const sessionId = data.data.id || data.data.attributes.id || "";
    try { await supabaseRequest("orders", { method: "POST", body: JSON.stringify({ reference, status: "pending", customer_name: text(customer.name, 120), customer_email: text(customer.email, 160), customer_phone: text(customer.phone, 40), shipping_address: text(customer.address, 400), total_php: totalPhp, items: orderItems, paymongo_checkout_session_id: sessionId }) }); } catch (error) { console.error("Order record error", error); }
    return json(res, 200, { checkout_url: data.data.attributes.checkout_url, reference_number: reference });
  } catch (error) { console.error(error); return json(res, 500, { error: "Unable to start checkout. Please try again." }); }
};
