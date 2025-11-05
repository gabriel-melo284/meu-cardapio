// api/categories.js
import { readJSON, writeJSON, ok, bad } from "./_blob";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await readJSON("categories.json", []);
    return ok(res, data);
  }
  if (req.method === "PUT") {
    try {
      const body = await parseJSON(req);
      await writeJSON("categories.json", body);
      return ok(res, true);
    } catch (e) {
      return bad(res, "JSON inválido.");
    }
  }
  res.setHeader("Allow", "GET, PUT");
  return bad(res, "Método não permitido.");
}

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "null"));
      } catch (e) {
        reject(e);
      }
    });
  });
}
