const { json, parseBody, hasSupabase, isPasswordCorrect, issueAdminToken } = require("../_lib");
module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!process.env.ADMIN_PASSWORD) return json(res, 503, { error: "ADMIN_PASSWORD has not been configured in Vercel." });
  if (!hasSupabase()) return json(res, 503, { error: "Connect Supabase before using product management." });
  if (!isPasswordCorrect(parseBody(req).password)) return json(res, 401, { error: "Incorrect password." });
  return json(res, 200, { token: issueAdminToken(), expires_in: 28800 });
};
