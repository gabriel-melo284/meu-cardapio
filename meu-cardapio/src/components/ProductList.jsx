import React from "react";
import { currency } from "../helpers/utils";

export default function ProductList({
  menu,
  categories,
  tab,
  query,
  addToCart,
  isAdmin,
  setMenu,
  setViewItem,
  setShowNewItem,
  setNewItemCat,
}) {

  const filtered = (catId) => {
    const base = menu.filter(i => i.available);
    const byTab = tab === "principal" ? base : base.filter(i => i.category === catId);
    if (!query.trim()) return byTab;
    const q = query.toLowerCase();
    return byTab.filter(i =>
      i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
    );
  };

  const Card = ({ item }) => (
    <div className="bg-white rounded-xl border overflow-hidden flex flex-col shadow-sm">
      <button onClick={() => setViewItem(item)} className="w-full aspect-[4/3] bg-neutral-100">
        <img
          className="w-full h-full object-cover"
          src={item.img}
          alt={item.name}
          onError={(e)=> e.currentTarget.src="https://via.placeholder.com/400x300?text=Sem+imagem"}
        />
      </button>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold leading-tight text-sm md:text-base line-clamp-2">{item.name}</h4>
          <span className="text-sm font-semibold whitespace-nowrap">{currency(item.price)}</span>
        </div>
        <p className="text-xs md:text-sm text-neutral-600 line-clamp-2">{item.desc}</p>
        <div className="mt-1 flex items-center gap-2">
          <button
            className="flex-1 py-2 rounded-lg border text-sm font-medium"
            onClick={() => addToCart(item)}
          >
            Adicionar
          </button>
          {isAdmin && (
            <>
              <button
                className="px-3 py-2 rounded-lg border text-sm"
                onClick={() => {
                  // abrir edição via modal de item de visualização
                  setViewItem(item);
                }}
                title="Editar"
              >
                ✎
              </button>
              <button
                className="px-3 py-2 rounded-lg border text-sm"
                onClick={() => setMenu(prev => prev.filter(p => p.id !== item.id))}
                title="Remover"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Título da sessão */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            {tab === "principal"
              ? "Todos os Produtos"
              : (categories.find(c=>c.id===tab)?.label || "Sessão")}
          </h2>

          {/* Botão + sem texto */}
          {isAdmin && tab !== "principal" && !query.trim() && (
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
              title="Adicionar item nesta sessão"
              onClick={() => { setNewItemCat(tab); setShowNewItem(true); }}
            >
              +
            </button>
          )}
        </div>

        {/* GRID de cards menores e padronizados */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          { (tab === "principal"
              ? categories.flatMap(c => filtered(c.id))
              : filtered(tab)
            ).map(it => <Card key={it.id} item={it} />)
          }
        </div>

        {/* Quando principal, mostra subtítulos por sessão (opcional) */}
        {tab === "principal" && !query.trim() && (
          <div className="mt-8 space-y-8">
            {categories.map(cat => {
              const items = filtered(cat.id);
              if (!items.length) return null;
              return (
                <section key={cat.id}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-extrabold">{cat.label}</h3>
                    {isAdmin && (
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600"
                        title={`Adicionar item em ${cat.label}`}
                        onClick={() => { setNewItemCat(cat.id); setShowNewItem(true); }}
                      >
                        +
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map(it => <Card key={it.id} item={it} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* espaço vazio — carrinho fixo ocupa a direita */}
      <div className="hidden lg:block" />
    </div>
  );
}
