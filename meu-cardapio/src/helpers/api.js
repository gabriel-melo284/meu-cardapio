// src/helpers/api.js
const base =
  typeof window === "undefined"
    ? "" // no server render
    : ""; // Vercel usa o mesmo host /api

async function getJSON(path, fallback) {
  try {
    const res = await fetch(base + path, { cache: "no-store" });
    if (!res.ok) return fallback;
    const j = await res.json();
    return j?.data ?? fallback;
  } catch {
    return fallback;
  }
}

async function putJSON(path, data) {
  try {
    await fetch(base + path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data ?? null),
    });
    return true;
  } catch {
    return false;
  }
}

export const api = {
  loadCategories(fallback = []) {
    return getJSON("/api/categories", fallback);
  },
  saveCategories(data) {
    return putJSON("/api/categories", data);
  },
  loadMenu(fallback = []) {
    return getJSON("/api/menu", fallback);
  },
  saveMenu(data) {
    return putJSON("/api/menu", data);
  },
  loadOrders(fallback = []) {
    return getJSON("/api/orders", fallback);
  },
  saveOrders(data) {
    return putJSON("/api/orders", data);
  },
};
