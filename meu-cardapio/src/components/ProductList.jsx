// src/components/ProductList.jsx
import React from "react";
import CardItem from "./CardItem";
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
  const q = query.trim().toLowerCase();

  const visibleItems = menu
    .filter((i) => i.available)
    .filter((i) => (tab === "principal" ? true : i.category === tab))
    .filter((i) =>
      q
        ? i.name.toLowerCase().includes(q) ||
          (i.desc || "").toLowerCase().includes(q)
        : true
    );

  // Listagem por sessão na aba "principal"
  if (tab === "principal" && !q) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-10">
        {categories.map((cat) => {
          const items = menu.filter(
            (i) => i.available && i.category === cat.id
          );
          const showSection = isAdmin ? true : items.length > 0;

          if (!showSection) {
            return (
              <div key={cat.id}>
                <SectionHeader
                  title={cat.label}
                  isAdmin={isAdmin}
                  onAdd={() => {
                    setNewItemCat(cat.id);
                    setShowNewItem(true);
                  }}
                />
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
              <SectionHeader
                title={cat.label}
                isAdmin={isAdmin}
                onAdd={() => {
                  setNewItemCat(cat.id);
                  setShowNewItem(true);
                }}
              />
              <Grid>
                {items.map((item) => (
                  <div key={item.id} className="h-full">
                    <CardItem
                      item={item}
                      onAdd={addToCart}
                      isAdmin={isAdmin}
                      onEdit={(u) =>
                        setMenu((prev) => prev.map((p) => (p.id === u.id ? u : p)))
                      }
                      onDelete={(id) =>
                        setMenu((prev) => prev.filter((p) => p.id !== id))
                      }
                      onView={(i) => setViewItem(i)}
                    />
                  </div>
                ))}
              </Grid>
            </div>
          );
        })}
      </div>
    );
  }

  // Listagem simples (quando filtra por aba ou busca)
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
      <Grid>
        {visibleItems.map((item) => (
          <div key={item.id} className="h-full">
            <CardItem
              item={item}
              onAdd={addToCart}
              isAdmin={isAdmin}
              onEdit={(u) =>
                setMenu((prev) => prev.map((p) => (p.id === u.id ? u : p)))
              }
              onDelete={(id) =>
                setMenu((prev) => prev.filter((p) => p.id !== id))
              }
              onView={(i) => setViewItem(i)}
            />
          </div>
        ))}
      </Grid>
    </div>
  );
}

/* --------- UI helpers --------- */

function SectionHeader({ title, isAdmin, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xl sm:text-2xl font-extrabold">{title}</h3>
      {isAdmin && (
        <button
          onClick={onAdd}
          className="w-10 h-10 rounded-full bg-orange-500 text-white shadow hover:bg-orange-600 flex items-center justify-center"
          title="Adicionar item"
          aria-label="Adicionar item"
        >
          {/* só o “+” sem texto */}
          +
        </button>
      )}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 [grid-auto-rows:1fr] items-stretch">
      {children}
    </div>
  );
}
