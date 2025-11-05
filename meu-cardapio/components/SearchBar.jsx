import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="bg-white sticky top-0 z-40 border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="relative">

          {/* Ícone padrão */}
          {!query.trim() && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              🔍
            </div>
          )}

          <input
            className="w-full bg-neutral-100 rounded-full pl-12 pr-4 py-3 text-base focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar no cardápio"
          />
        </div>
      </div>
    </div>
  );
}
