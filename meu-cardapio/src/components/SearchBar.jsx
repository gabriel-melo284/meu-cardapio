import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="bg-white sticky top-0 z-40 border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="relative">

          {/* Ícone padrão */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.35-4.65a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>


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

