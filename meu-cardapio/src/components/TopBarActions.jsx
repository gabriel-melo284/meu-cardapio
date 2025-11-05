import { STORE } from "../helpers/config";

export default function TopBarActions({ isAdmin, onGoAdmin }) {
  // fixo no topo direito, acima do conteúdo
  return (
    <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
      {isAdmin && (
        <button
          onClick={onGoAdmin}
          className="px-3 py-2 rounded-full bg-orange-500 text-white text-sm shadow hover:bg-orange-600"
          title="Ver pedidos (admin)"
        >
          Pedidos
        </button>
      )}
    </div>
  );
}
