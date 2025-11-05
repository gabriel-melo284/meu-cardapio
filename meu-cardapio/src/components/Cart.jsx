import React, { useState } from "react";
import { currency } from "../helpers/utils";

export default function Cart({ cart, updateQty, subtotal, setPage, isAdmin }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const hasItems = cart.length > 0;

  return (
    <>
      {/* Mobile: bloco normal */}
      <aside className="lg:hidden bg-white rounded-2xl shadow-sm p-4 mx-3 sm:mx-4 mb-20">
        <h3 className="font-semibold text-lg mb-3">Seu carrinho</h3>
        <CartList cart={cart} updateQty={updateQty} />
        <CartFooter
          subtotal={subtotal}
          hasItems={hasItems}
          onCheckout={() => setShowCheckout(true)}
          isAdmin={isAdmin}
          onOrders={() => setPage("pedidos")}
        />
      </aside>

      {/* Desktop: carrinho fixo na direita */}
      <aside className="
        hidden lg:block
        fixed right-0 top-[120px] bottom-0
        w-[360px] p-4
        bg-white border-l shadow-sm overflow-auto
      ">
        <h3 className="font-semibold text-lg mb-3">Seu carrinho</h3>
        <CartList cart={cart} updateQty={updateQty} />
        <CartFooter
          subtotal={subtotal}
          hasItems={hasItems}
          onCheckout={() => setShowCheckout(true)}
          isAdmin={isAdmin}
          onOrders={() => setPage("pedidos")}
        />
      </aside>

      {/* Modal de checkout com escolha de forma de pagamento */}
      {showCheckout && (
        <CheckoutModal
          subtotal={subtotal}
          onClose={() => setShowCheckout(false)}
          onPix={() => { setShowCheckout(false); setPage("pix"); }}
        />
      )}
    </>
  );
}

function CartList({ cart, updateQty }) {
  if (cart.length === 0) {
    return <div className="text-center text-neutral-500 py-10">Carrinho vazio</div>;
  }
  return (
    <div className="space-y-3">
      {cart.map(it => (
        <div key={it.id} className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-sm">{it.name}</div>
            <div className="text-xs text-neutral-500">{currency(it.price)} × {it.qty}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border rounded-full" onClick={()=> updateQty(it.id, -1)}>−</button>
            <button className="px-2 py-1 border rounded-full" onClick={()=> updateQty(it.id, +1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CartFooter({ subtotal, hasItems, onCheckout, isAdmin, onOrders }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="border-t pt-3 flex items-center justify-between font-semibold">
        <span>Subtotal</span><span>{currency(subtotal)}</span>
      </div>
      <button
        disabled={!hasItems}
        onClick={onCheckout}
        className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
      >
        Finalizar pedido
      </button>

      {isAdmin && (
        <button
          onClick={onOrders}
          className="w-full py-3 rounded-xl border font-semibold"
        >
          Ver pedidos
        </button>
      )}
    </div>
  );
}

/* Modal simples de escolha de pagamento */
function CheckoutModal({ subtotal, onClose, onPix }) {
  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <h3 className="text-lg font-bold">Como deseja pagar?</h3>
          <p className="text-sm text-neutral-600 mt-1">Total: <b>{currency(subtotal)}</b></p>

          <div className="mt-4 grid gap-2">
            <button
              onClick={onPix}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold"
            >
              PIX (gerar QR Code)
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border font-semibold"
            >
              Cartão/Outro (não gerar QR)
            </button>
          </div>

          <button onClick={onClose} className="mt-4 w-full py-2 text-sm text-neutral-600 underline">
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
