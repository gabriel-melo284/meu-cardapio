import React from "react";
import { STORE } from "../helpers/config";

export default function Banner() {
  return (
    <div className="relative h-44 sm:h-52 md:h-64 w-full overflow-hidden">
      <img
        src={STORE.banner}
        alt="banner"
        className="w-full h-full object-cover"
      />

      {/* overlay suave */}
      <div className="absolute inset-0 bg-black/25"></div>
    </div>
  );
}
