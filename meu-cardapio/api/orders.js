// /api/orders.js
export const config = { runtime: "nodejs18.x" };

export default async function handler(req, res) {
  // Import dinâmico para garantir compatibilidade no runtime Node
  const { put, list } = await import("@vercel/blob");

  try {
    if (req.method === "GET") {
      // Procura o blob "orders.json" (sem sufixo aleatório)
      const blobs = await list({ prefix: "orders.json", limit: 1 });
      if (!blobs.blobs.length) {
        return res.status(200).json([]); // sem pedidos ainda
      }

      const blob = blobs.blobs[0];
      // A URL retornada por list já é assinada (mesmo se privado)
      const data = await fetch(blob.url).then((r) => r.json());
      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const body = req.body || [];
      // Salva sempre no mesmo nome (sem sufixo) para sobrescrever
      await put("orders.json", JSON.stringify(body), {
        access: "private",              // pode ser "public" se preferir
        addRandomSuffix: false,
        contentType: "application/json",
      });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("API /api/orders error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
