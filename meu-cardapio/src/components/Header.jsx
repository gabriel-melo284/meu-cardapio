import React from "react";
import { STORE } from "../helpers/config";
import { businessStatus } from "../helpers/utils";

export default function Header() {
  return (
    <div className="bg-white pt-4 pb-1 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">

        {/* Logo */}
        <img
          src={STORE.logo}
          alt="logo"
          className="w-28 h-28 sm:w-32 sm:h-32"
        />

        {/* Texto */}
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-neutral-900 leading-tight">
            {STORE.name}
          </h1>

          <p className="text-neutral-600 text-sm">
            {STORE.address} • {STORE.city}
          </p>

          <p className="text-neutral-700 font-semibold text-sm">
            {businessStatus(STORE.opensAt, STORE.closesAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

