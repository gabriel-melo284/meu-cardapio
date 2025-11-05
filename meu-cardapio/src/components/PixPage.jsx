import { useEffect } from "react";
import { STORE } from "../helpers/config";
import { generatePixPayload } from "../helpers/pix";   // se já estiver inline no seu projeto, adapte o import
import { generateQRCodeSVG } from "../helpers/qr";     // idem

export default function PixPage({ cart, subtotal, clearCart, orders, setOrders, setPage }) {
  const orderId = "P" + Date.now();

  const payload = generatePixPayload({
    chave: STORE.pixChave,
    valor: subtotal,
    nome: STORE.name,
    cidade: STORE.city,
    id: orderId,
  });

  useEffect(() => {
    const hoje = new Date();
    const dataBR = hoje.toLocaleString("pt-BR");
    const novo = {
      id: orderId,
      data: dataBR,
      items: cart,
      total: subtotal,
      payment: "pix",
      status: "aguardando pagamento",
      pix: { copiaCola: payload },
    };
    setOrders([...orders, novo]);
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const qrSVG = generateQRCodeSVG(payload, 300);

  function copiarCodigo() {
    navigator.clipboard.writeText(payload);
    alert("Código PIX copiado!");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-6 sm:p-8 max-w-lg w-full">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">Pague com PIX</h1>
          <p className="text-neutral-600 mt-1">
            Escaneie o QR Code ou copie o código abaixo.
          </p>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border shadow-sm p-4 bg-white">
            <div
              className="flex justify-center"
              dangerouslySetInnerHTML={{ __html: qrSVG }}
            />
          </div>
          <p className="mt-4 text-center text-lg font-bold">
            Total: {new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(subtotal)}
          </p>
        </div>

        <textarea
          readOnly
          className="w-full border rounded-xl p-3 text-sm mt-4"
          rows={4}
          value={payload}
        />

        <div className="mt-3 grid gap-2">
          <button onClick={copiarCodigo} className="w-full py-3 rounded-xl bg-black text-white font-semibold">
            Copiar código PIX
          </button>
          <button onClick={() => setPage("menu")} className="w-full py-3 rounded-xl border">
            Voltar ao cardápio
          </button>
        </div>
      </div>
    </div>
  );
}
