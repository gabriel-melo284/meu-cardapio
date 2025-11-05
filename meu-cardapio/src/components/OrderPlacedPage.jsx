export default function OrderPlacedPage({ order, onBack }) {
  if (!order) return null;
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold">Pedido registrado 🎉</h1>
        <p className="text-neutral-600 mt-2">
          ID do pedido: <b>{order.id}</b>
        </p>
        <p className="text-neutral-600">Forma de pagamento: <b>{order.payment}</b></p>
        <p className="mt-3 text-green-700 font-semibold">Status: {order.status}</p>

        <div className="mt-6 text-left border-t pt-4 space-y-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span>{it.qty}× {it.name}</span>
              <span>{new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(it.price*it.qty)}</span>
            </div>
          ))}
          <div className="border-t pt-3 text-right font-bold text-lg">
            Total: {new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(order.total)}
          </div>
        </div>

        <button className="mt-6 w-full py-3 rounded-xl bg-black text-white" onClick={onBack}>
          Voltar ao cardápio
        </button>
      </div>
    </div>
  );
}
