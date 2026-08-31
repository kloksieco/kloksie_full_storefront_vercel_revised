const { json, parseBody, text, hasSupabase, hasPayMongo, supabaseRequest, siteUrl } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 503, { error: "The store catalog has not been connected yet." });
  if (!hasPayMongo()) return json(res, 503, { error: "PayMongo checkout has not been configured yet." });

  try {
    const body = parseBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};
    if (body.currency !== "USD") return json(res, 400, { error: "International orders must use USD." });
    if (!items.length || items.length > 20) return json(res, 400, { error: "Your bag is empty or invalid." });

    const name = text(customer.name, 120), email = text(customer.email, 160), phone = text(customer.phone, 40), address = text(customer.address, 1000);
    if (!name || !email || !address) return json(res, 400, { error: "Please complete your name, email, and shipping address." });

    const requested = new Map();
    for (const item of items) {
      const id = text(item.id, 80), color = text(item.color, 80), size = text(item.size, 40), quantity = Number(item.quantity);
      if (!/^[a-z0-9-]+$/.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return json(res, 400, { error: "Invalid cart item." });
      const key = `${id}::${color}::${size}`;
      const old = requested.get(key);
      requested.set(key, { id, color, size, quantity: (old?.quantity || 0) + quantity });
    }

    const ids = [...new Set([...requested.values()].map(x => x.id))];
    const rows = await supabaseRequest(`products?select=id,name,description,international_price_usd,stock,active&id=in.(${ids.join(",")})`);
    if (!Array.isArray(rows) || rows.length !== ids.length) return json(res, 400, { error: "One or more pieces are no longer available." });
    const variants = await supabaseRequest(`product_variants?select=id,product_id,color,size,stock&product_id=in.(${ids.join(",")})`);
    const current = new Map(rows.map(p => [p.id, p]));
    const variantMap = new Map((variants || []).map(v => [`${v.product_id}::${v.color || ""}::${v.size || ""}`, v]));
    const orderItems = [], lineItems = [];
    let totalUsd = 0;

    for (const item of requested.values()) {
      const p = current.get(item.id);
      if (!p || !p.active || !Number.isFinite(Number(p.international_price_usd)) || Number(p.international_price_usd) <= 0) return json(res, 400, { error: `${p ? p.name : "A piece"} is not available for international ordering.` });
      const hasVariants = (variants || []).some(v => v.product_id === p.id);
      const v = variantMap.get(`${p.id}::${item.color}::${item.size}`);
      const stock = hasVariants ? (v?.stock ?? 0) : Number(p.stock || 0);
      if (hasVariants && !v) return json(res, 400, { error: `The selected color/size for ${p.name} is no longer available.` });
      if (stock < item.quantity) return json(res, 400, { error: `${p.name} is not available in the requested quantity.` });
      const unitUsd = Number(p.international_price_usd);
      totalUsd += unitUsd * item.quantity;
      orderItems.push({ id: p.id, name: p.name, price_usd: unitUsd, color: item.color, size: item.size, quantity: item.quantity, variant_id: v?.id || null });
    }

    // PayMongo currently processes checkout/payment amounts in PHP. International customers can still pay by Visa/Mastercard; the USD merchandise total shown on KLOKSIE is converted to PHP for the hosted payment page.
    const usdToPhp = Number(process.env.INTERNATIONAL_USD_TO_PHP_RATE || 58);
    if (!Number.isFinite(usdToPhp) || usdToPhp <= 0) return json(res, 500, { error: "International payment conversion is not configured." });
    const totalPhp = Math.round(totalUsd * usdToPhp * 100) / 100;
    const reference = `KLOKSIE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    lineItems.push({ name: `International merchandise — ${totalUsd.toFixed(2)} USD`, description: "International shipping is calculated separately and paid separately after the order is confirmed.", amount: Math.round(totalPhp * 100), currency: "PHP", quantity: 1 });

    const origin = siteUrl(req);
    const payload = { data: { attributes: {
      line_items: lineItems,
      payment_method_types: ["card"],
      success_url: `${origin}/success.html?reference=${encodeURIComponent(reference)}`,
      cancel_url: `${origin}/#shop`,
      reference_number: reference,
      description: `KLOKSIE international order ${reference}`,
      billing: { name, email, phone, address: { line1: address, country: "PH" } },
      metadata: { currency_display: "USD", merchandise_total_usd: totalUsd.toFixed(2), shipping_status: "PENDING" }
    } } };

    const authorization = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64");
    const response = await fetch("https://api.paymongo.com/v2/checkout_sessions", { method: "POST", headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok || !data?.data?.attributes?.checkout_url) return json(res, 502, { error: "PayMongo could not create the international payment checkout." });

    const sessionId = data.data.id || "";
    try {
      await supabaseRequest("orders", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ reference, status: "pending_payment", customer_name: name, customer_email: email, customer_phone: phone, shipping_address: address, total_php: totalPhp, items: orderItems.map(item => ({ ...item, currency: "USD" })), paymongo_checkout_session_id: sessionId }) });
    } catch (error) { console.error("International order record error", error); }

    return json(res, 200, { success: true, checkout_url: data.data.attributes.checkout_url, reference_number: reference, currency: "USD", merchandise_total_usd: Number(totalUsd.toFixed(2)), payment_currency: "PHP", payment_total_php: totalPhp, shipping_status: "PENDING" });
  } catch (error) {
    console.error("International order error", error);
    return json(res, 500, { error: error?.message || "Unable to start international payment. Please try again." });
  }
};
