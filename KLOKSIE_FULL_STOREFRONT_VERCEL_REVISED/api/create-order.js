const { json } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  return json(res, 410, { error: "This checkout endpoint has been replaced. Please use the current Kloksie checkout." });
};
