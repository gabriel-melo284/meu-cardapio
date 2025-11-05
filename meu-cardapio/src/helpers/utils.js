// Moeda BRL
export const currency = (n) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Query param
export const getParam = (k) => {
  try {
    return new URL(window.location.href).searchParams.get(k);
  } catch {
    return null;
  }
};

// Transformar HH:MM → Date
export const parseHM = (hm) => {
  const [h, m] = String(hm || "00:00").split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
};

// ✅ ESTA FUNÇÃO PRECISAVA SER EXPORTADA!
export const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Status de funcionamento
export const businessStatus = (opensAt, closesAt) => {
  const now = new Date();
  const open = parseHM(opensAt);
  const close = parseHM(closesAt);
  if (now < open) return `Abre às ${opensAt}`;
  if (now >= open && now <= close) return `Fecha às ${closesAt}`;
  return `Abre amanhã às ${opensAt}`;
};
