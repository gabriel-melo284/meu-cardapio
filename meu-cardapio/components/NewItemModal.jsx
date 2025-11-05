import { createPortal } from "react-dom";
import { useState } from "react";

function Portal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function NewItemModal({ currentCategory, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    id: "it_" + Math.random().toString(36).slice(2, 8),
    category: currentCategory || categories[0]?.id,
    name: "",
    desc: "",
    price: 0,
    img: "",
    available: true,
  });

  return (
    <Portal>
      <div className="fixed inset-0 z-[10000]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-3 shadow-2xl pointer-events-auto">
            <h3 className="text-lg font-semibold">Novo item</h3>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">
                Nome
                <input className="w-full border rounded-xl px-3 py-2 mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
              </label>

              <label className="text-sm">
                Preço
                <input type="number" className="w-full border rounded-xl px-3 py-2 mt-1" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value)||0 })}/>
              </label>

              <label className="text-sm col-span-2">
                Descrição
                <textarea className="w-full border rounded-xl px-3 py-2 mt-1" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}/>
              </label>

              <label className="text-sm col-span-2">
                URL da imagem
                <input className="w-full border rounded-xl px-3 py-2 mt-1" value={form.img} onChange={e => setForm({ ...form, img: e.target.value })}/>
              </label>

              <label className="text-sm">
                Categoria
                <select className="w-full border rounded-xl px-3 py-2 mt-1" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>

              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })}/>
                Disponível
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded-xl">Cancelar</button>
              <button onClick={() => { if(!form.name.trim()) return alert("Dê um nome."); onSave(form); onClose(); }} className="px-4 py-2 bg-black text-white rounded-xl">Adicionar</button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
