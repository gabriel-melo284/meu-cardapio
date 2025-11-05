// src/helpers/utils.js

export const currency = (n) =>
  Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function parseHM(hm) {
  const [h, m] = String(hm).split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function businessStatus(opensAt, closesAt) {
  const now = new Date();
  const open = parseHM(opensAt);
  const close = parseHM(closesAt);

  if (now < open) return `Abre às ${opensAt}`;
  if (now >= open && now <= close) return `Fecha às ${closesAt}`;
  return `Abre amanhã às ${opensAt}`;
}

export function getParam(key) {
  try {
    return new URL(window.location.href).searchParams.get(key);
  } catch {
    return null;
  }
}
