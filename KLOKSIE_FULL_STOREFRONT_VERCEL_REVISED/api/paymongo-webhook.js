const crypto = require("crypto");
const { json, hasSupabase, supabaseRequest } = require("./_lib");

module.exports.config = { api: { bodyParser: false } };

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function validSignature(raw, header, secret) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(String(header).split(",").map(x => {
    const i = x.indexOf("=");
    return i > 0 ? [x.slice(0, i), x.slice(i + 1)] : [x, ""];
  }));
  if (!parts.t) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(parts.t));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(String(parts.t) + "." + raw.toString()).digest("hex");
  const supplied = parts.li || parts.te || "";
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 503, { error: "Supabase is not configured." });
  const raw = await rawBody(req);
  if (!validSignature(raw, req.headers["paymongo-signature"], process.env.PAYMONGO_WEBHOOK_SECRET)) {
    return json(res, 401, { error: "Invalid webhook signature." });
  }

  try {
    const body = JSON.parse(raw.toString("utf8"));
    const event = body?.data;
    const type = event?.type || "";
    const session = event?.attributes || {};
    if (type === "checkout_session.payment.paid") {
      const reference = String(session.reference_number || "").trim();
      if (reference) {
        await supabaseRequest("rpc/fulfill_paid_order", { method:"POST", body:JSON.stringify({order_reference:reference}) });
      }
    }
    if (type === "checkout_session.payment.failed") {
      const reference = String(session.reference_number || "").trim();
      if (reference) {
        await supabaseRequest(`orders?reference=eq.${encodeURIComponent(reference)}&status=eq.pending&limit=1`);
      }
    }
    return json(res, 200, { received: true });
  } catch (error) {
    console.error("PayMongo webhook error:", error);
    return json(res, 200, { received: true });
  }
};
