import { useEffect, useMemo } from "react";
import { currency } from "../helpers/utils";
import { STORE, LS } from "../helpers/config";
import { save, load } from "../helpers/storage";

/* ----- PIX payload + QR (offline) ----- */
function crc16(str) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
const pad2 = (n) => String(n).padStart(2, "0");

function pixPayload({ chave, valor, nome, cidade, id }) {
  const gui = "BR.GOV.BCB.PIX";
  const f = [];
  const add = (id, val) => f.push(id + pad2(val.length) + val);

  // Merchant account (ID 26)
  const merchant = [];
  merchant.push("00" + pad2(gui.length) + gui);
  merchant.push("01" + pad2(chave.length) + chave);
  const mStr = merchant.join("");
  const mField = "26" + pad2(mStr.length) + mStr;

  add("00", "01"); // payload format
  add("01", "12"); // initiation method
  f.push(mField);
  add("52", "0000"); // merchant category
  add("53", "986");  // BRL
  add("54", valor.toFixed(2));
  add("58", "BR");
  add("59", nome);
  add("60", cidade);
  // Additional data field (62)
  const addData = "05" + pad2(id.length) + id;
  add("62", addData);

  const body = f.join("") + "6304";
  return body + crc16(body);
}

function tinyQR(text, size = 260) {
  // QR muito simples: usa canvas por célula gerada via hash
  // (não é QR oficial, mas funciona como marcador visual).
  // Para produção, troque por uma lib QR-code. Mantendo offline aqui:
  const cells = 33;
  const s = size / cells;
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  const rects = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      if ((hash & 3) === 0) {
        rects.push(`<rect x="${c * s}" y="${r * s}" width="${s}" height="${s}" fill="black"/>`);
      }
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${rects.join("")}</svg>`;
}

export default function PixPage({ cart, subtotal, clearCart, orders, setOrders, setPage }) {
  const orderId = useMemo(() => "P" + Date.now(), []);
  const payload = useMemo(() => pixPayload({
    chave: STORE.pixChave,
    valor: subtotal || 0,
    nome: STORE.name,
    cidade: STORE.city,
    id: orderId,
  }), [subtotal, orderId]);

  const qrSVG = useMemo(() => tinyQR(payload, 260), [payload]);

  useEffect(() => {
    if (!cart.length) return;
    const dataBR = new Date().toLocaleString("pt-BR");
    const novo = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      status: "aguardando pagamento",
      pix: { copiaCola: payload },
    };
    const next = [...orders, novo];
    setOrders(next);
    save(LS.orders("umami"), next);
    clearCart();
  }, []); // salva ao entrar

  function copiar() {
    navigator.clipboard.writeText(payload);
    alert("Código PIX copiado!");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-extrabold mb-2">Pagamento PIX</h1>
        <p className="text-neutral-600 mb-4">Escaneie o QR Code ou copie o código.</p>

        <div className="mx-auto bg-white p-3 rounded-xl border shadow" dangerouslySetInnerHTML={{ __html: qrSVG }} />

        <p className="mt-4 font-semibold">Total: {currency(subtotal)}</p>

        <textarea readOnly className="w-full border rounded-xl p-3 text-sm mt-4" rows={4} value={payload} />
        <button onClick={copiar} className="mt-3 w-full py-2 bg-black text-white rounded-xl">Copiar código PIX</button>
        <button onClick={() => setPage("menu")} className="mt-3 w-full py-2 bg-neutral-200 rounded-xl">Voltar ao cardápio</button>
      </div>
    </div>
  );
}
