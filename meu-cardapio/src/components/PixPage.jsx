import React, { useEffect, useMemo, useRef } from "react";
import { currency } from "../helpers/utils";
import { api } from "../helpers/api";

// ===== Helpers PIX (use os seus se já tiver) =====
function crc16(str) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function pad2(n) { return String(n).padStart(2, "0"); }
function generatePixPayload({ chave, valor, nome, cidade, id }) {
  const gui = "BR.GOV.BCB.PIX";
  const f = [];
  const add = (id, value) => f.push(id + pad2(value.length) + value);

  const m = [];
  m.push("00" + pad2(gui.length) + gui);
  if (chave) m.push("01" + pad2(chave.length) + chave);
  const mStr = m.join("");
  const mField = "26" + pad2(mStr.length) + mStr;

  add("00", "01");
  add("01", "12");
  f.push(mField);
  add("52", "0000");
  add("53", "986");
  add("54", Number(valor || 0).toFixed(2));
  add("58", "BR");
  add("59", nome);
  add("60", cidade);
  // id de referência (TXID) no campo adicional (62)
  const addData = "05" + pad2(String(id).length) + String(id);
  f.push("62" + pad2(addData.length) + addData);

  const payload = f.join("") + "6304";
  const crc = crc16(payload);
  return payload + crc;
}
// QR simples em SVG (preto/branco), pode trocar pelo seu
function qrAsSVG(text, size = 260) {
  // Para simplificar, usa um QR bem básico que muitos já têm pronto.
  // Se você já tinha um gerador, mantenha o seu e substitua essa função.
  // Aqui, mostramos um “placeholder” com o payload embaixo
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size+40}">
      <rect width="100%" height="${size}" fill="white"/>
      <rect x="0" y="0" width="${size}" height="${size}" fill="white" stroke="black"/>
      <text x="50%" y="${size+18}" text-anchor="middle" font-size="12" fill="#333">
        PIX gerado
      </text>
    </svg>
  `;
}
// ================================================

/**
 * Props esperadas do App:
 * - cart, subtotal, clearCart
 * - orders, setOrders
 * - setPage
 * - STORE (opcional; se não tiver, substitua pelos seus dados)
 */
export default function PixPage({
  cart = [],
  subtotal = 0,
  clearCart,
  orders,
  setOrders,
  setPage,
  STORE = {
    name: "Umami Fit - Gourmet",
    city: "Uberlândia",
    pixChave: "+5534998970471",
  },
}) {
  // id único do pedido
  const orderId = useMemo(() => "P" + Date.now(), []);
  // montar payload PIX
  const payload = useMemo(
    () =>
      generatePixPayload({
        chave: STORE.pixChave,
        valor: subtotal,
        nome: STORE.name,
        cidade: STORE.city,
        id: orderId,
      }),
    [STORE.pixChave, STORE.name, STORE.city, subtotal, orderId]
  );
  const svg = useMemo(() => qrAsSVG(payload, 260), [payload]);

  // Garante que só criamos e salvamos o pedido UMA vez
  const createdRef = useRef(false);
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    // monta objeto do pedido
    const agora = new Date();
    const dataBR = agora.toLocaleString("pt-BR"); // dd/mm/aaaa hh:mm:ss

    const novo = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      status: "aguardando pagamento",
      pix: {
        copiaCola: payload,
      },
    };

    // evita duplicar caso já exista um com mesmo ID
    const exists = orders.some((p) => p.id === orderId);
    const next = exists ? orders : [...orders, novo];

    setOrders(next);       // <<< ESSENCIAL: atualiza estado da aplicação
    api.saveOrders(next);  // <<< Opcional: força salvar no Blob imediatamente

    clearCart?.();         // limpa o carrinho após gerar o pedido
  }, [cart, subtotal, orderId, payload, orders, setOrders, clearCart]);

  function copiarPIX() {
    navigator.clipboard.writeText(payload);
    alert("Código PIX copiado!");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-extrabold mb-2">Pagamento PIX</h1>
        <p className="text-neutral-600 mb-4">
          Escaneie o QR Code abaixo ou copie o código PIX.
        </p>

        <div
          className="mx-auto bg-white p-3 rounded-xl border shadow"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <p className="mt-4 font-semibold">Total: {currency(subtotal)}</p>

        <textarea
          readOnly
          className="w-full border rounded-xl p-3 text-sm mt-4"
          rows={4}
          value={payload}
        />

        <button
          onClick={copiarPIX}
          className="mt-3 w-full py-2 bg-black text-white rounded-xl"
        >
          Copiar código PIX
        </button>

        <button
          onClick={() => setPage("menu")}
          className="mt-3 w-full py-2 bg-neutral-200 rounded-xl"
        >
          Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}
