// /api/orders.js
export const config = { runtime: "nodejs20.x" }; // ou 18.x

export default async function handler(req, res) {
  const { put, list } = await import("@vercel/blob");

  try {
    if (req.method === "GET") {
      const blobs = await list({ prefix: "orders.json", limit: 1 });
      if (!blobs.blobs.length) return res.status(200).json([]);
      const data = await fetch(blobs.blobs[0].url).then(r => r.json());
      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const body = req.body || [];
      await put("orders.json", JSON.stringify(body), {
        access: "private",
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
