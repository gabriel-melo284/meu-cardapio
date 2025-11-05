import React from "react";
import CardItem from "./CardItem";

/**
 * Props esperadas:
 * - menu: array de itens [{id, category, name, desc, price, img, available}]
 * - categories: array de categorias [{id, label}]
 * - tab: string  ("principal" ou id da categoria)
 * - query: string (busca)
 * - addToCart: fn(item)
 * - isAdmin: boolean
 * - setMenu: fn(updater)
 * - setViewItem: fn(item)
 * - setShowNewItem: fn(boolean)
 * - setNewItemCat: fn(categoryId)
 */
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
  const q = (query || "").trim().toLowerCase();

  // Itens disponíveis
  const avail = Array.isArray(menu) ? menu.filter((i) => i.available) : [];

  // Filtro por busca (nome, descrição ou nome da categoria)
  const filteredBySearch = q
    ? avail.filter((i) => {
        const catLabel =
          categories.find((c) => c.id === i.category)?.label?.toLowerCase() ||
          "";
        return (
          (i.name || "").toLowerCase().includes(q) ||
          (i.desc || "").toLowerCase().includes(q) ||
          catLabel.includes(q)
        );
      })
    : avail;

  // Se há busca ativa, ignoramos seções/tab e mostramos só o resultado
  if (q) {
    return (
      <section className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold">Resultados</h2>
          {isAdmin && (
            <button
              onClick={() => {
                setNewItemCat(tab === "principal" ? categories[0]?.id : tab);
                setShowNewItem(true);
              }}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white shadow hover:opacity-95"
              title="Adicionar novo item"
            >
              + Adicionar item
            </button>
          )}
        </div>

        {filteredBySearch.length === 0 ? (
          <div className="text-neutral-500 bg-white border rounded-2xl p-6">
            Nenhum item encontrado para “{query}”.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBySearch.map((item) => (
              <CardItem
                key={item.id}
                item={item}
                onAdd={addToCart}
                isAdmin={isAdmin}
                onEdit={(upd) =>
                  setMenu((prev) => prev.map((p) => (p.id === upd.id ? upd : p)))
                }
                onDelete={(id) => setMenu((prev) => prev.filter((p) => p.id !== id))}
                onView={(i) => setViewItem(i)}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Sem busca:
  // - Se tab === "principal": mostrar seções por categoria
  // - Senão: mostrar itens da categoria selecionada
  if (tab === "principal") {
    return (
      <section className="lg:col-span-2">
        <div className="space-y-10">
          {categories.map((cat) => {
            const items = avail.filter((i) => i.category === cat.id);
            const showSection = isAdmin ? true : items.length > 0;

            if (!showSection) {
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl sm:text-2xl font-extrabold">
                      {cat.label}
                    </h3>

                    {/* Botão admin para adicionar item na seção vazia */}
                    {isAdmin && (
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:opacity-95"
                        title={`Adicionar item em ${cat.label}`}
                        onClick={() => {
                          setNewItemCat(cat.id);
                          setShowNewItem(true);
                        }}
                      >
                        +
                      </button>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="text-sm text-neutral-400 italic">
                      Nenhum item nesta sessão.
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl sm:text-2xl font-extrabold">
                    {cat.label}
                  </h3>

                  {/* Botão admin para adicionar item nesta seção */}
                  {isAdmin && (
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:opacity-95"
                      title={`Adicionar item em ${cat.label}`}
                      onClick={() => {
                        setNewItemCat(cat.id);
                        setShowNewItem(true);
                      }}
                    >
                      +
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <CardItem
                      key={item.id}
                      item={item}
                      onAdd={addToCart}
                      isAdmin={isAdmin}
                      onEdit={(upd) =>
                        setMenu((prev) =>
                          prev.map((p) => (p.id === upd.id ? upd : p))
                        )
                      }
                      onDelete={(id) =>
                        setMenu((prev) => prev.filter((p) => p.id !== id))
                      }
                      onView={(i) => setViewItem(i)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão flutuante (admin) para adicionar item rápido
            - Só aparece em telas menores para facilitar no mobile */}
        {isAdmin && (
          <button
            onClick={() => {
              // por padrão, usamos a primeira categoria se estiver na principal
              const fallbackCat = categories[0]?.id || "marmitas";
              setNewItemCat(fallbackCat);
              setShowNewItem(true);
            }}
            className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl text-3xl"
            title="Adicionar novo item"
          >
            +
          </button>
        )}
      </section>
    );
  }

  // Categoria específica selecionada (sem busca)
  const itemsOfTab = filteredBySearch.filter((i) => i.category === tab);

  return (
    <section className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          {categories.find((c) => c.id === tab)?.label || "Sessão"}
        </h2>

        {isAdmin && (
          <button
            onClick={() => {
              setNewItemCat(tab);
              setShowNewItem(true);
            }}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white shadow hover:opacity-95"
            title="Adicionar item nesta sessão"
          >
            + Adicionar item
          </button>
        )}
      </div>

      {itemsOfTab.length === 0 ? (
        <div className="text-neutral-500 bg-white border rounded-2xl p-6">
          {isAdmin
            ? "Nenhum item nesta sessão. Clique em “+ Adicionar item”."
            : "Nenhum item disponível nesta sessão no momento."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {itemsOfTab.map((item) => (
            <CardItem
              key={item.id}
              item={item}
              onAdd={addToCart}
              isAdmin={isAdmin}
              onEdit={(upd) =>
                setMenu((prev) => prev.map((p) => (p.id === upd.id ? upd : p)))
              }
              onDelete={(id) => setMenu((prev) => prev.filter((p) => p.id !== id))}
              onView={(i) => setViewItem(i)}
            />
          ))}
        </div>
      )}

      {/* Botão flutuante (admin) — útil no mobile */}
      {isAdmin && (
        <button
          onClick={() => {
            setNewItemCat(tab);
            setShowNewItem(true);
          }}
          className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl text-3xl"
          title="Adicionar novo item"
        >
          +
        </button>
      )}
    </section>
  );
}
