const { json, hasSupabase, hasPayMongo } = require("./_lib");
module.exports = async (req, res) => {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed." });
  return json(res, 200, { ok: true, supabase_configured: hasSupabase(), paymongo_configured: hasPayMongo(), admin_configured: Boolean(process.env.ADMIN_PASSWORD) });
};
