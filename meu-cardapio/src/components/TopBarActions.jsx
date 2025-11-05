export default function TopBarActions({ isAdmin, onOpenOrders }) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-end gap-2">
        {isAdmin && (
          <button
            onClick={onOpenOrders}
            className="px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-neutral-50"
          >
            Ver pedidos
          </button>
        )}
      </div>
    </div>
  );
}
