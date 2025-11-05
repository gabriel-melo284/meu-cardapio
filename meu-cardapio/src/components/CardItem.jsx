import { currency } from "../helpers/utils";

export default function CardItem({ item, onAdd, isAdmin, setMenu, onView }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
      <button className="w-full" onClick={() => onView(item)}>
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-44 sm:h-48 object-cover"
          onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400?text=Imagem"; }}
          loading="lazy"
        />
      </button>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold leading-tight">{item.name}</h4>
          <span className="text-sm font-semibold">{currency(item.price)}</span>
        </div>

        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{item.desc}</p>

        <button
          className="mt-3 w-full py-2 rounded-lg border font-medium"
          onClick={() => onAdd(item)}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
