import React from "react";

export default function Tabs({
  tab,
  setTab,
  categories,
  query,
  isAdmin,
  setShowNewCat
}) {
  return (
    <div className="bg-white sticky top-[64px] z-30 border-b">
      <div className="max-w-6xl mx-auto px-4 py-2 overflow-x-auto">
        
        <div className="flex items-center gap-2 whitespace-nowrap">

          {/* Tab principal */}
          <button
            className={`px-4 py-2 rounded-full border text-sm font-semibold ${
              tab === "principal"
                ? "bg-black text-white"
                : "bg-white text-neutral-800"
            }`}
            onClick={() => setTab("principal")}
          >
            Principal
          </button>

          {/* Tabs de categorias */}
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setTab(c.id);
              }}
              className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                tab === c.id
                  ? "bg-black text-white"
                  : "bg-white text-neutral-700"
              }`}
            >
              {c.label}
            </button>
          ))}

          {/* Botão admin */}
          {isAdmin && (
            <button
              onClick={() => setShowNewCat(true)}
              className="ml-auto w-10 h-10 rounded-full bg-orange-500 text-white font-bold shadow"
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
