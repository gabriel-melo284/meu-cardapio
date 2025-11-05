import React from "react";
import { businessStatus } from "../helpers/utils";
import { STORE } from "../helpers/config";

export default function Header({ isAdmin, onOpenOrders }) {
  const statusText = businessStatus(STORE.opensAt, STORE.closesAt);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex items-center gap-4 py-5">
          <img
            src={STORE.logo}
            alt="logo"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-8 ring-white object-cover bg-white shadow-md"
          />
          <div className="py-1">
            <h1 className="text-neutral-900 text-2xl sm:text-3xl md:text-4xl font-extrabold">
              {STORE.name}
            </h1>
            <p className="text-neutral-700 text-sm sm:text-base md:text-lg font-medium">
              {STORE.address} • {STORE.city}
            </p>
            <p className="text-neutral-600 text-sm sm:text-base md:text-lg font-semibold">
              {statusText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
