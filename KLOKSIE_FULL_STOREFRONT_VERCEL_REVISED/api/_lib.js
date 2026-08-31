const crypto = require("crypto");

const PRODUCT_FIELDS = "id,name,description,image,alt,price,international_price_usd,stock,tag,size,category,active,sort_order,created_at,updated_at";

function json(res, status, body) { res.status(status).setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); return res.end(JSON.stringify(body)); }
function parseBody(req) { if (!req.body) return {}; if (typeof req.body === "object") return req.body; try { return JSON.parse(req.body); } catch { return {}; } }
function text(value, max = 500) { return String(value || "").trim().slice(0, max); }
function boolean(value, fallback = true) { if (typeof value === "boolean") return value; if (typeof value === "string") return value.toLowerCase() !== "false"; return fallback; }
function slug(value) { return text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64); }
function normalizeImages(input) { const list = Array.isArray(input) ? input : []; return list.map((item, index) => ({ image_url: text(typeof item === "string" ? item : item.image_url, 2000), sort_order: Number.isInteger(Number(typeof item === "string" ? index : item.sort_order)) ? Number(typeof item === "string" ? index : item.sort_order) : index, is_featured: Boolean(typeof item === "string" ? index === 0 : item.is_featured) })).filter(item => item.image_url); }
function normalizeVariants(input) { const list = Array.isArray(input) ? input : []; return list.map(item => ({ color: text(item.color, 80), size: text(item.size, 40), stock: Number(item.stock) })).filter(item => (item.color || item.size) && Number.isInteger(item.stock) && item.stock >= 0).slice(0, 200); }
function normalizeProduct(input, { requireId = false } = {}) {
  const name = text(input.name, 120), id = slug(input.id || name), price = Number(input.price), internationalPrice = input.international_price_usd === "" || input.international_price_usd == null ? null : Number(input.international_price_usd), stock = Number(input.stock), sortOrder = Number(input.sort_order);
  if (!name) throw new Error("Product name is required.");
  if (!id || (requireId && !id)) throw new Error("A valid product ID is required.");
  if (!Number.isInteger(price) || price < 0 || price > 10000000) throw new Error("Price must be a whole PHP amount.");
  if (internationalPrice !== null && (!Number.isFinite(internationalPrice) || internationalPrice < 0 || internationalPrice > 1000000)) throw new Error("International price must be a valid USD amount.");
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new Error("Stock must be a whole number.");
  const image = text(input.image, 2000), images = normalizeImages(input.images), variants = normalizeVariants(input.variants);
  const featured = images.find(item => item.is_featured) || images[0];
  return { id, name, description: text(input.description, 1000), image: image || (featured ? featured.image_url : ""), alt: text(input.alt, 200) || name, price, international_price_usd: internationalPrice, stock, tag: text(input.tag, 40), size: text(input.size, 200), category: text(input.category, 60) || "Archive", active: boolean(input.active), sort_order: Number.isInteger(sortOrder) ? sortOrder : 0, images, variants };
}
function hasSupabase() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
function hasPayMongo() { return Boolean(process.env.PAYMONGO_SECRET_KEY); }
async function supabaseRequest(path, options = {}) { if (!hasSupabase()) throw new Error("Supabase is not configured."); const base = process.env.SUPABASE_URL.replace(/\/$/, ""); const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", ...(options.headers || {}) } }); const raw = await response.text(); let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; } if (!response.ok) { const message = typeof data === "object" && data && data.message ? data.message : "Supabase request failed."; const error = new Error(message); error.status = response.status; throw error; } return data; }
function b64url(value) { return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
function unb64url(value) { return Buffer.from(String(value).replace(/-/g, "+").replace(/_/g, "/"), "base64"); }
function signingKey() { return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ""; }
function issueAdminToken() { const now = Math.floor(Date.now() / 1000); const payload = b64url(JSON.stringify({ role: "admin", iat: now, exp: now + 60 * 60 * 8 })); const signature = b64url(crypto.createHmac("sha256", signingKey()).update(payload).digest()); return `${payload}.${signature}`; }
function verifyAdmin(req) { const authorization = String(req.headers.authorization || ""), token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "", [payload, signature] = token.split("."); if (!payload || !signature || !signingKey()) return false; const expected = b64url(crypto.createHmac("sha256", signingKey()).update(payload).digest()), a = Buffer.from(signature), b = Buffer.from(expected); if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false; try { const claims = JSON.parse(unb64url(payload).toString("utf8")); return claims.role === "admin" && Number(claims.exp) > Math.floor(Date.now() / 1000); } catch { return false; } }
function isPasswordCorrect(value) { const configured = String(process.env.ADMIN_PASSWORD || ""), submitted = String(value || ""), a = Buffer.from(configured), b = Buffer.from(submitted); return Boolean(configured) && a.length === b.length && crypto.timingSafeEqual(a, b); }
function siteUrl(req) { if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, ""); const protocol = String(req.headers["x-forwarded-proto"] || "https").split(",")[0]; return `${protocol}://${req.headers.host}`; }
module.exports = { PRODUCT_FIELDS, json, parseBody, text, boolean, slug, normalizeProduct, normalizeImages, normalizeVariants, hasSupabase, hasPayMongo, supabaseRequest, issueAdminToken, verifyAdmin, isPasswordCorrect, siteUrl };
