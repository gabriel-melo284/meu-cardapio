// api/_blob.js
import { list, put } from "@vercel/blob";

const STORE_PREFIX = "stores/umami/"; // mude se quiser separar por loja

export async function readJSON(key, fallback) {
  try {
    const pathname = STORE_PREFIX + key;
    const { blobs } = await list({ prefix: pathname });
    const hit = blobs?.find(b => b.pathname === pathname);
    if (!hit) return fallback;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export async function writeJSON(key, data) {
  const pathname = STORE_PREFIX + key;
  const body = JSON.stringify(data, null, 2);
  const { url } = await put(pathname, body, {
    access: "public",
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN, // criado automaticamente pelo Vercel
  });
  return { url };
}

export function ok(res, data) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, data });
}
export function bad(res, msg = "Bad Request") {
  res.status(400).json({ ok: false, error: msg });
}
