export default function Cart({ cart, updateQty, subtotal, setPage, isAdmin }) {
  return (
    <aside
      className="
        fixed right-0 top-24 
        h-[calc(100vh-6rem)]
        w-full md:w-[360px]
        bg-white border-l shadow-xl z-40
        px-4 py-4 flex flex-col
      "
    >
      <h3 className="font-semibold text-lg mb-3">Seu carrinho</h3>

      <div className="flex-1 overflow-auto space-y-3">
        {cart.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">Carrinho vazio</div>
        ) : (
          cart.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-sm">{it.name}</div>
                <div className="text-xs text-neutral-500">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(it.price)} × {it.qty}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded-full"
                  onClick={() => updateQty(it.id, -1)}
                >
                  −
                </button>
                <button
                  className="px-2 py-1 border rounded-full"
                  onClick={() => updateQty(it.id, +1)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-3 flex items-center justify-between font-semibold">
        <span>Subtotal</span>
        <span>
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(subtotal)}
        </span>
      </div>

      <button
        onClick={() => setPage("pix")}
        className="mt-3 w-full py-3 rounded-xl bg-black text-white font-semibold"
      >
        Finalizar pedido
      </button>

      {isAdmin && (
        <button
          onClick={() => setPage("pedidos")}
          className="mt-2 w-full py-3 rounded-xl bg-orange-500 text-white font-semibold"
        >
          Pedidos (admin)
        </button>
      )}
    </aside>
  );
}
