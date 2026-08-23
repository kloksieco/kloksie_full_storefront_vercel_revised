const { json, verifyAdmin, supabaseRequest, parseBody, text } = require("../_lib");

module.exports = async (req, res) => {
  if (!verifyAdmin(req)) return json(res, 401, { error: "Please sign in again." });
  try {
    if (req.method === "GET") {
      const orders = await supabaseRequest("orders?select=id,reference,status,customer_name,customer_email,customer_phone,shipping_address,total_php,items,paymongo_checkout_session_id,created_at&order=created_at.desc");
      return json(res, 200, { orders: Array.isArray(orders) ? orders : [] });
    }
    if (req.method === "PATCH") {
      const body = parseBody(req);
      const id = text(body.id, 100), status = text(body.status, 30).toLowerCase();
      const allowed = ["pending", "paid", "processing", "shipped", "completed", "cancelled", "failed"];
      if (!id || !allowed.includes(status)) return json(res, 400, { error: "Invalid order update." });
      const updated = await supabaseRequest(`orders?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status }) });
      if (!Array.isArray(updated) || !updated[0]) return json(res, 404, { error: "Order not found." });
      return json(res, 200, { order: updated[0] });
    }
    return json(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("Admin orders error:", error);
    return json(res, error.status === 404 ? 404 : 500, { error: error.message || "Unable to load orders." });
  }
};
