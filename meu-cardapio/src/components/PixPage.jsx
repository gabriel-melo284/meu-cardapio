import React, { useEffect } from "react";
import { currency } from "../helpers/utils";
import { STORE } from "../helpers/config";
import { generatePixPayload, generateQRCodeSVG } from "../helpers/pix";

export default function PixPage({ cart, subtotal, clearCart, orders, setOrders, setPage }) {
  const orderId = "P" + Date.now();

  const payload = generatePixPayload({
    chave: STORE.pixChave || "+5534998970471",
    valor: subtotal,
    nome: STORE.name,
    cidade: STORE.city,
    id: orderId,
  });

  const qrSVG = generateQRCodeSVG(payload, 300);

  function salvarPedido() {
    const hoje = new Date();
    const dataBR = hoje.toLocaleString("pt-BR");
    const novo = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      status: "aguardando pagamento",
      pix: { copiaCola: payload },
    };
    setOrders([...orders, novo]);
    clearCart();
  }

  useEffect(() => {
    salvarPedido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copiarCodigo() {
    navigator.clipboard.writeText(payload);
    alert("Código PIX copiado!");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-lg w-full">
        <h1 className="text-2xl font-extrabold text-center">Pagamento via PIX</h1>
        <p className="text-neutral-600 text-center mt-1">
          Escaneie o QR Code ou copie o código para pagar.
        </p>

        <div className="mt-5 mx-auto w-full flex items-center justify-center">
          <div className="p-4 bg-white rounded-2xl border shadow">
            {/* Moldura do QR */}
            <div className="bg-white rounded-xl p-3 border" dangerouslySetInnerHTML={{ __html: qrSVG }} />
          </div>
        </div>

        <div className="mt-4 text-center text-xl font-bold">
          Total: {currency(subtotal)}
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold">Código PIX (copia e cola)</label>
          <textarea
            readOnly
            className="w-full border rounded-xl p-3 text-sm mt-1"
            rows={4}
            value={payload}
          />
        </div>

        <div className="mt-3 grid gap-2">
          <button
            onClick={copiarCodigo}
            className="w-full py-3 rounded-xl bg-black text-white font-semibold"
          >
            Copiar código PIX
          </button>
          <button
            onClick={() => setPage("menu")}
            className="w-full py-3 rounded-xl border font-semibold"
          >
            Voltar ao cardápio
          </button>
        </div>
      </div>
    </div>
  );
}

