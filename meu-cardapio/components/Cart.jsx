import { currency } from "../helpers/utils";

export default function Cart({ cart, updateQty, subtotal, setPage, isAdmin }) {
  return (
    <aside className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.06)] md:static md:shadow-none md:border md:rounded-2xl p-4 md:h-max md:sticky md:top-24 max-w-7xl md:max-w-none mx-auto">
      <div className="md:max-w-sm md:ml-auto">
        <h3 className="font-semibold text-lg mb-3">Seu carrinho</h3>

        {cart.length === 0 ? (
          <div className="text-center text-neutral-500 py-6">Carrinho vazio</div>
        ) : (
          <div className="space-y-3">
            {cart.map((it) => (
              <div key={it.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{it.name}</div>
                  <div className="text-xs text-neutral-500">{currency(it.price)} × {it.qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border rounded-full" onClick={() => updateQty(it.id, -1)}>−</button>
                  <button className="px-3 py-1.5 border rounded-full" onClick={() => updateQty(it.id, +1)}>+</button>
                </div>
              </div>
            ))}

            <div className="border-t pt-3 flex items-center justify-between font-semibold">
              <span>Subtotal</span><span>{currency(subtotal)}</span>
            </div>

            <button
              onClick={() => setPage("pix")}
              className="w-full py-3 rounded-xl bg-black text-white font-semibold"
            >
              Finalizar pedido
            </button>

            {isAdmin && (
              <button
                onClick={() => setPage("pedidos")}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold"
              >
                Ver pedidos (admin)
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
