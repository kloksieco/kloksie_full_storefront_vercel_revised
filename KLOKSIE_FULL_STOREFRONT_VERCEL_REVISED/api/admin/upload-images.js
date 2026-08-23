const crypto = require("crypto");
const { json, parseBody, verifyAdmin, hasSupabase } = require("../_lib");

module.exports = async (req, res) => {
  if (!verifyAdmin(req)) return json(res, 401, { error: "Please sign in again." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!hasSupabase()) return json(res, 503, { error: "Supabase is not configured." });
  try {
    const body = parseBody(req);
    const files = Array.isArray(body.files) ? body.files : [];
    if (!files.length || files.length > 12) return json(res, 400, { error: "Upload between 1 and 12 images." });
    const base = process.env.SUPABASE_URL.replace(/\/$/, "");
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = "product-images";
    const bucketResponse = await fetch(`${base}/storage/v1/bucket`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: bucket, name: bucket, public: true }) });
    if (!bucketResponse.ok && bucketResponse.status !== 409) console.warn("Could not create product image bucket", await bucketResponse.text());
    const uploads = [];
    for (const file of files) {
      const dataUrl = String(file.data || "");
      const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/i);
      if (!match) throw new Error("Only JPG, PNG, WEBP, and GIF images are supported.");
      const mime = match[1].toLowerCase(), buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 8 * 1024 * 1024) throw new Error("Each image must be 8MB or smaller.");
      const ext = mime.split("/")[1].replace("jpeg", "jpg");
      const path = `products/${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${ext}`;
      const response = await fetch(`${base}/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": mime, "x-upsert": "false" }, body: buffer });
      if (!response.ok) throw new Error(`Image upload failed: ${await response.text()}`);
      uploads.push({ image_url: `${base}/storage/v1/object/public/${bucket}/${path}`, name: String(file.name || "") });
    }
    return json(res, 200, { images: uploads });
  } catch (error) { console.error(error); return json(res, 400, { error: error.message || "Unable to upload images." }); }
};
