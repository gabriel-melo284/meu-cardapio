import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="sticky top-[48px] md:top-[48px] z-30 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="relative">
          {!query.trim() && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
              {/* Lupa outline em SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          <input
            placeholder="Buscar no cardápio"
            className="w-full rounded-full border pl-12 pr-4 py-3 text-base focus:outline-none"
            value={query}
            onChange={(e)=> setQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
