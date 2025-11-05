import { STORE } from "../helpers/config";

export default function WhatsFab({ presetMsg = "Olá! Quero fazer um pedido." }) {
  const href = `https://wa.me/${STORE.whatsPhone}?text=${encodeURIComponent(presetMsg)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:opacity-90"
      title="Falar no WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.6.8 5 2.2 7L4 29l7-2c1.9 1.2 4.2 1.9 6.6 1.9 6.6 0 12-5.4 12-12S22.6 3 16 3Z" fill="#25D366"/>
        <path d="M12.9 10.8c-.2-.6-.4-.6-.6-.6h-.5c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7 0 1.6 1.2 3.2 1.4 3.5.2.3 2.4 3.8 5.9 5.2 2.9 1.1 3.5.9 4.1.8.6-.1 2-.8 2.3-1.7.3-.9.3-1.6.2-1.7-.1-.1-.3-.2-.6-.4-.3-.2-2-.9-2.3-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.1-.2.1-.4.2-.7 0-.3-.2-1.2-.4-2.3-1.5-0.8-.8-1.4-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.6.1-.2.1-.3.2-.5.1-.2 0-.4 0-.6 0-.2-.6-1.6-.8-2.1Z" fill="#fff"/>
      </svg>
    </a>
  );
}
