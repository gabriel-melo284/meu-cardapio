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
          className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
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
