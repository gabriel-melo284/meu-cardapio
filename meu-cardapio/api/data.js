// /api/data.js
import { put, list } from "@vercel/blob";

export const config = {
  runtime: "edge",
};

const KEY = "umami-data.json";
const DEFAULT_DATA = { categories: [], menu: [], orders: [] };

export default async function handler(req) {
  if (req.method === "GET") {
    // Procura o blob atual
    const blobs = await list({ prefix: KEY });
    if (blobs?.blobs?.length) {
      const res = await fetch(blobs.blobs[0].url);
      const json = await res.json();
      return new Response(JSON.stringify(json), {
        headers: { "content-type": "application/json" },
      });
    }
    // Se não existir ainda, devolve estrutura padrão
    return new Response(JSON.stringify(DEFAULT_DATA), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const body = await req.json();

    // Salva JSON no Blob com o mesmo nome (sobrescreve)
    await put(KEY, JSON.stringify(body), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN, // defina na Vercel
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
