import { createPortal } from "react-dom";

export default function CheckoutModal({ open, subtotal, onClose, onChoose }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl pointer-events-auto">
          <h3 className="text-xl font-extrabold">Como deseja pagar?</h3>
          <p className="text-neutral-600">
            Total: <b>{new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(subtotal)}</b>
          </p>
          <div className="grid gap-3">
            <button
              className="w-full py-3 rounded-xl border font-semibold hover:bg-neutral-50"
              onClick={() => onChoose("cartao")}
            >
              Cartão
            </button>
            <button
              className="w-full py-3 rounded-xl border font-semibold hover:bg-neutral-50"
              onClick={() => onChoose("dinheiro")}
            >
              Dinheiro
            </button>
            <button
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              onClick={() => onChoose("pix")}
            >
              PIX
            </button>
          </div>
          <button className="w-full py-2 rounded-xl border" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
