function NewItemModal({ currentCategory, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    id: `id_${Math.random().toString(36).slice(2, 8)}`,
    category: currentCategory,
    name: "",
    desc: "",
    price: 0,
    img: "",
    available: true,
  });

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-2xl w-full max-w-lg p-6 space-y-3 shadow-2xl">
            <h3 className="text-lg font-semibold">
              Novo item ({categories.find((c) => c.id === currentCategory)?.label})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="text-neutral-500">Nome</span>
                <input
                  className="w-full border rounded-xl px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="text-sm">
                <span className="text-neutral-500">Preço</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-xl px-3 py-2"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value || 0) })}
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-neutral-500">Descrição</span>
                <textarea
                  className="w-full border rounded-xl px-3 py-2"
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-neutral-500">URL da imagem</span>
                <input
                  className="w-full border rounded-xl px-3 py-2"
                  value={form.img}
                  onChange={(e) => setForm({ ...form, img: e.target.value })}
                />
              </label>
              <label className="text-sm flex items-end gap-2">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                />
                Disponível
              </label>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-xl border" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-black text-white"
                onClick={() => onSave(form)}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
