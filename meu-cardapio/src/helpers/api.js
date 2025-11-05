// src/helpers/api.js
export async function fetchRemoteData() {
  const r = await fetch("/api/data", { cache: "no-store" });
  if (!r.ok) throw new Error("Falha ao carregar dados remotos");
  return r.json();
}

export async function saveRemoteData(payload) {
  const r = await fetch("/api/data", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Falha ao salvar dados remotos");
  return r.json();
}
