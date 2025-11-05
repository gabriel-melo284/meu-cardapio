import React from "react";
import CardItem from "./CardItem";

/**
 * Props:
 * - menu, categories, tab, query
 * - addToCart, isAdmin, setMenu, setViewItem, setShowNewItem, setNewItemCat
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
  const avail = Array.isArray(menu) ? menu.filter((i) => i.available) : [];

  const searched = q
    ? avail.filter((i) => {
        const catLabel =
          categories.find((c) => c.id === i.category)?.label?.toLowerCase() || "";
        return (
          (i.name || "").toLowerCase().includes(q) ||
          (i.desc || "").toLowerCase().includes(q) ||
          catLabel.includes(q)
        );
      })
    : avail;

  // Com busca: ignora seções, mostra só resultados
  if (q) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold">Resultados</h2>

          {isAdmin && (
            <button
              onClick={() => {
                const fallbackCat = tab === "principal" ? (categories[0]?.id || "marmitas") : tab;
                setNewItemCat(fallbackCat);
                setShowNewItem(true);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:opacity-95"
              title="Adicionar novo item"
              aria-label="Adicionar item"
            >
              +
            </button>
          )}
        </div>

        {searched.length === 0 ? (
          <div className="text-neutral-500 bg-white border rounded-2xl p-6">
            Nenhum item encontrado para “{query}”.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {searched.map((item) => (
              <CardItem
                key={item.id}
                item={item}
                onAdd={addToCart}
                isAdmin={isAdmin}
                onEdit={(upd) =>
                  setMenu((prev) => prev.map((p) => (p.id === upd.id ? upd : p)))
                }
                onDelete={(id) => setMenu((prev) => prev.filter((p) => p.id !== id))}
                onView={setViewItem}
                size="md"
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Principal: seções compactas
  if (tab === "principal") {
    return (
      <section>
        <div className="space-y-10">
          {categories.map((cat) => {
            const items = avail.filter((i) => i.category === cat.id);
            const showSection = isAdmin ? true : items.length > 0;

            if (!showSection) {
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl sm:text-2xl font-extrabold">{cat.label}</h3>
                    {isAdmin && (
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white shadow hover:opacity-95"
                        title={`Adicionar item em ${cat.label}`}
