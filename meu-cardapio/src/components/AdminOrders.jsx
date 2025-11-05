// src/components/AdminOrders.jsx
import React, { useEffect } from "react";
import { api } from "../helpers/api";
import { currency } from "../helpers/utils";

export default function AdminOrders({ orders, setOrders, setPage }) {
  // polling leve a cada 7s
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const remote = await api.loadOrders(orders);
      if (!alive) return;
      // só atualiza se mudou de fato
      const localStr = JSON.stringify(orders);
      const remoteStr = JSON.stringify(remote);
      if (localStr !== remoteStr) setOrders(remote);
    };
    tick();
    const id = setInterval(tick, 7000);
    return () => { alive = false; clearInterval(id); };
  }, [orders, setOrders]);

  function confirmarPagamento(id) {
    const atualizado = orders.map((p) =>
      p.id === id ? { ...p, status: "pagamento confirmado" } : p
    );
    setOrders(atualizado); // salvará no Blob via useEffect do App
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold mb-6">Pedidos realizados</h1>

        {orders.length === 0 ? (
          <p className="text-neutral-600">Nenhum pedido foi feito ainda.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((p) => (
              <div key={p.id} className="border rounded-2xl p-5 shadow-sm bg-neutral-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-lg">Pedido {p.id}</h2>
                    <p className="text-neutral-600 text-sm">{p.data}</p>
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        p.status === "pagamento confirmado" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Status: {p.status}
                    </p>
                  </div>
                  {p.status !== "pagamento confirmado" && (
                    <button
                      onClick={() => confirmarPagamento(p.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl shadow"
                    >
                      Confirmar pagamento
                    </button>
                  )}
                </div>

                <div className="mt-4 border-t pt-4 space-y-2">
                  {p.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.qty}× {item.name}</span>
                      <span>{currency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t pt-3 text-right font-bold text-lg">
                  Total: {currency(p.total)}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setPage("menu")}
          className="mt-6 w-full py-3 rounded-xl bg-black text-white font-semibold"
        >
          Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}
