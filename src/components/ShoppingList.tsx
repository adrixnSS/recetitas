import React, { useState, useMemo } from 'react';
import { WeekPlan, Dish, DayCombo } from '../types/meal';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Share2,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';
import {
  loadCheckedGroceries,
  saveCheckedGroceries,
  loadCustomGroceries,
  saveCustomGroceries,
} from '../utils/storage';

interface ShoppingListProps {
  currentWeekPlan: WeekPlan;
  blueprint: DayCombo[];
  dishes: Dish[];
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  currentWeekPlan,
  blueprint,
  dishes,
}) => {
  const [checkedItems, setCheckedItems] = useState<string[]>(() => loadCheckedGroceries());
  const [customItems, setCustomItems] = useState<string[]>(() => loadCustomGroceries());
  const [newItemText, setNewItemText] = useState('');
  const [copied, setCopied] = useState(false);

  const dishesMap = useMemo(() => {
    const map: Record<string, Dish> = {};
    dishes.forEach((d) => (map[d.id] = d));
    return map;
  }, [dishes]);

  // Aggregate ingredients from current week's planned meals
  const mealIngredients = useMemo(() => {
    const items = new Set<string>();

    blueprint.forEach((day) => {
      ['comida', 'cena'].forEach((slotType) => {
        const slotKey = `day_${day.dayId}_${slotType}`;
        const slot = currentWeekPlan.slots[slotKey];
        if (!slot || slot.isFreeMeal) return;

        const slotDishes = [
          slot.primaryDishId ? dishesMap[slot.primaryDishId] : null,
          slot.sideDishId ? dishesMap[slot.sideDishId] : null,
          slot.starterDishId ? dishesMap[slot.starterDishId] : null,
        ].filter(Boolean) as Dish[];

        slotDishes.forEach((d) => {
          if (d.ingredients && Array.isArray(d.ingredients)) {
            d.ingredients.forEach((ing) => items.add(ing.trim()));
          }
        });
      });
    });

    return Array.from(items);
  }, [currentWeekPlan, blueprint, dishesMap]);

  // Categorize items
  const categorized = useMemo(() => {
    const all = Array.from(new Set([...mealIngredients, ...customItems]));

    const groups: {
      carniceria: string[];
      fruteria: string[];
      despensa: string[];
      lacteos: string[];
      otros: string[];
    } = {
      carniceria: [],
      fruteria: [],
      despensa: [],
      lacteos: [],
      otros: [],
    };

    all.forEach((item) => {
      const lower = item.toLowerCase();
      if (
        lower.includes('pollo') ||
        lower.includes('ternera') ||
        lower.includes('carne') ||
        lower.includes('alitas') ||
        lower.includes('hamburguesa') ||
        lower.includes('pescado') ||
        lower.includes('merluza') ||
        lower.includes('dorada') ||
        lower.includes('salmón') ||
        lower.includes('bacalao') ||
        lower.includes('jamón') ||
        lower.includes('lomo') ||
        lower.includes('panceta')
      ) {
        groups.carniceria.push(item);
      } else if (
        lower.includes('patata') ||
        lower.includes('boniato') ||
        lower.includes('cebolla') ||
        lower.includes('tomate') ||
        lower.includes('calabacín') ||
        lower.includes('calabaza') ||
        lower.includes('puerro') ||
        lower.includes('zanahoria') ||
        lower.includes('espinaca') ||
        lower.includes('berenjena') ||
        lower.includes('champiñón') ||
        lower.includes('pepino') ||
        lower.includes('pimiento') ||
        lower.includes('lechuga') ||
        lower.includes('fruta') ||
        lower.includes('limón')
      ) {
        groups.fruteria.push(item);
      } else if (
        lower.includes('arroz') ||
        lower.includes('pasta') ||
        lower.includes('espaguetis') ||
        lower.includes('macarrones') ||
        lower.includes('fideos') ||
        lower.includes('garbanzo') ||
        lower.includes('lenteja') ||
        lower.includes('alubia') ||
        lower.includes('pan') ||
        lower.includes('aceite') ||
        lower.includes('curry') ||
        lower.includes('pimienta') ||
        lower.includes('pimentón')
      ) {
        groups.despensa.push(item);
      } else if (
        lower.includes('huevo') ||
        lower.includes('leche') ||
        lower.includes('queso') ||
        lower.includes('nata') ||
        lower.includes('mantequilla')
      ) {
        groups.lacteos.push(item);
      } else {
        groups.otros.push(item);
      }
    });

    return groups;
  }, [mealIngredients, customItems]);

  const toggleCheck = (item: string) => {
    const updated = checkedItems.includes(item)
      ? checkedItems.filter((i) => i !== item)
      : [...checkedItems, item];
    setCheckedItems(updated);
    saveCheckedGroceries(updated);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const updated = [...customItems, newItemText.trim()];
    setCustomItems(updated);
    saveCustomGroceries(updated);
    setNewItemText('');
  };

  const handleDeleteCustom = (item: string) => {
    const updated = customItems.filter((i) => i !== item);
    setCustomItems(updated);
    saveCustomGroceries(updated);
    setCheckedItems(checkedItems.filter((i) => i !== item));
  };

  const handleCopyShoppingList = () => {
    let text = `🛒 *LISTA DE LA COMPRA DE LA SEMANA*\n\n`;

    const addSection = (title: string, items: string[]) => {
      if (items.length === 0) return;
      text += `*${title}*\n`;
      items.forEach((item) => {
        const isBought = checkedItems.includes(item);
        text += `${isBought ? '✅' : '⬜'} ${item}\n`;
      });
      text += '\n';
    };

    addSection('🥩 Carnicería y Pescadería', categorized.carniceria);
    addSection('🥦 Frutas y Verduras', categorized.fruteria);
    addSection('🫘 Legumbres y Despensa', categorized.despensa);
    addSection('🧀 Lácteos y Huevos', categorized.lacteos);
    addSection('🥖 Básicos y Otros', categorized.otros);

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const renderGroup = (title: string, items: string[]) => {
    if (items.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2">
        <h4 className="font-extrabold text-stone-900 text-sm flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-semibold text-stone-400">
            {items.filter((i) => checkedItems.includes(i)).length}/{items.length}
          </span>
        </h4>

        <div className="space-y-1">
          {items.map((item) => {
            const isChecked = checkedItems.includes(item);
            const isCustom = customItems.includes(item);

            return (
              <div
                key={item}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                  isChecked
                    ? 'bg-stone-50 text-stone-400 line-through'
                    : 'hover:bg-amber-50/50 text-stone-800'
                }`}
              >
                <div
                  onClick={() => toggleCheck(item)}
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-stone-300 shrink-0" />
                  )}
                  <span className="font-medium">{item}</span>
                </div>

                {isCustom && (
                  <button
                    onClick={() => handleDeleteCustom(item)}
                    className="p-1 text-stone-300 hover:text-rose-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const totalItemsCount =
    categorized.carniceria.length +
    categorized.fruteria.length +
    categorized.despensa.length +
    categorized.lacteos.length +
    categorized.otros.length;

  const totalBoughtCount = checkedItems.length;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-500" />
            <span>Lista de la Compra Automática</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Generada a partir de los platos asignados en el menú semanal + tus productos habituales.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyShoppingList}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Copiada para WhatsApp!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copiar Lista</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add extra custom item bar */}
      <form
        onSubmit={handleAddCustom}
        className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs"
      >
        <input
          type="text"
          placeholder="Añadir producto adicional (ej: Papel de cocina, Yogures, Café...)"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </form>

      {/* Progress pill */}
      {totalItemsCount > 0 && (
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Comprados:{' '}
            <strong className="text-stone-800 font-bold">
              {totalBoughtCount} de {totalItemsCount}
            </strong>
          </span>
          {checkedItems.length > 0 && (
            <button
              onClick={() => {
                setCheckedItems([]);
                saveCheckedGroceries([]);
              }}
              className="text-stone-400 hover:text-stone-700 underline"
            >
              Desmarcar todos
            </button>
          )}
        </div>
      )}

      {/* Categorized Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {renderGroup('🥩 Carnicería y Pescadería', categorized.carniceria)}
        {renderGroup('🥦 Frutas y Verduras', categorized.fruteria)}
        {renderGroup('🫘 Legumbres y Despensa', categorized.despensa)}
        {renderGroup('🧀 Lácteos y Huevos', categorized.lacteos)}
        {renderGroup('🥖 Básicos y Otros', categorized.otros)}
      </div>
    </div>
  );
};
