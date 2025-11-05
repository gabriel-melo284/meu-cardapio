export default function CardItem({ item, onAdd, isAdmin, onEdit, onDelete, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
      <button className="w-full" onClick={() => onView(item)}>
        <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
          <img
            src={item.img}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/400x300?text=Sem+imagem";
            }}
          />
        </div>
      </button>

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-semibold leading-tight text-sm">{item.name}</h4>
            <span className="text-xs font-semibold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{item.desc}</p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            className="flex-1 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
            disabled={!item.available}
            onClick={() => onAdd(item)}
          >
            Adicionar
          </button>

          {isAdmin && (
            <>
              <button
                className="px-2 py-2 rounded-lg border text-sm"
                onClick={() => onEdit(item)}
                title="Editar"
              >
                ✎
              </button>
              <button
                className="px-2 py-2 rounded-lg border text-sm"
                onClick={() => onDelete(item.id)}
                title="Remover"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
