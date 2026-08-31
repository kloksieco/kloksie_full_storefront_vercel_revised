const { json, parseBody, text, hasSupabase, supabaseRequest } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 503, { error: "The store catalog has not been connected yet." });

  try {
    const body = parseBody(req);
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer || {};

    if (body.currency !== "USD") return json(res, 400, { error: "International orders must use USD." });
    if (!items.length || items.length > 20) return json(res, 400, { error: "Your bag is empty or invalid." });

    const name = text(customer.name, 120);
    const email = text(customer.email, 160);
    const phone = text(customer.phone, 40);
    const address = text(customer.address, 1000);
    if (!name || !email || !address) return json(res, 400, { error: "Please complete your name, email, and shipping address." });

    const requested = new Map();
    for (const item of items) {
      const id = text(item.id, 80);
      const color = text(item.color, 80);
      const size = text(item.size, 40);
      const quantity = Number(item.quantity);
      if (!/^[a-z0-9-]+$/.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return json(res, 400, { error: "Invalid cart item." });
      }
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
    const orderItems = [];
    let totalUsd = 0;

    for (const item of requested.values()) {
      const p = current.get(item.id);
      if (!p || !p.active || !Number.isFinite(Number(p.international_price_usd)) || Number(p.international_price_usd) <= 0) {
        return json(res, 400, { error: `${p ? p.name : "A piece"} is not available for international ordering.` });
      }
      const hasVariants = (variants || []).some(v => v.product_id === p.id);
      const v = variantMap.get(`${p.id}::${item.color}::${item.size}`);
      const stock = hasVariants ? (v?.stock ?? 0) : Number(p.stock || 0);
      if (hasVariants && !v) return json(res, 400, { error: `The selected color/size for ${p.name} is no longer available.` });
      if (stock < item.quantity) return json(res, 400, { error: `${p.name} is not available in the requested quantity.` });

      const unitUsd = Number(p.international_price_usd);
      totalUsd += unitUsd * item.quantity;
      orderItems.push({ id: p.id, name: p.name, price_usd: unitUsd, color: item.color, size: item.size, quantity: item.quantity, variant_id: v?.id || null });
    }

    const reference = `KLOKSIE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await supabaseRequest("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        reference,
        status: "international_shipping_pending",
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        total_php: 0,
        items: orderItems.map(item => ({ ...item, currency: "USD" })),
        paymongo_checkout_session_id: `INTERNATIONAL-${totalUsd.toFixed(2)}-SHIPPING-PENDING`
      })
    });

    return json(res, 200, {
      success: true,
      reference_number: reference,
      currency: "USD",
      merchandise_total_usd: Number(totalUsd.toFixed(2)),
      shipping_status: "PENDING"
    });
  } catch (error) {
    console.error("International order error", error);
    return json(res, 500, { error: error?.message || "Unable to place international order. Please try again." });
  }
};
