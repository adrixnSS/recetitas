import React from 'react';
import {
  DayCombo,
  WeekPlan,
  Dish,
  SlotSelection,
  MealRequirement,
} from '../types/meal';
import {
  PROTEIN_LABELS,
  CARB_LABELS,
  VEG_LABELS,
  evaluateComboMatch,
} from '../utils/matching';
import {
  Sun,
  Moon,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  Dices,
  Flame,
  Check,
} from 'lucide-react';

interface WeeklyBoardProps {
  blueprint: DayCombo[];
  currentWeekPlan: WeekPlan;
  dishes: Dish[];
  onSelectSlot: (dayId: number, slotType: 'comida' | 'cena') => void;
  onClearSlot: (slotKey: string) => void;
  onToggleCompleteSlot: (slotKey: string) => void;
  onOpenRoulette: (dayId: number, slotType: 'comida' | 'cena') => void;
}

export const WeeklyBoard: React.FC<WeeklyBoardProps> = ({
  blueprint,
  currentWeekPlan,
  dishes,
  onSelectSlot,
  onClearSlot,
  onToggleCompleteSlot,
  onOpenRoulette,
}) => {
  const dishesMap = React.useMemo(() => {
    const map: Record<string, Dish> = {};
    dishes.forEach((d) => (map[d.id] = d));
    return map;
  }, [dishes]);

  // Today indicator
  const todayDate = new Date();
  let currentDayId = todayDate.getDay();
  currentDayId = currentDayId === 0 ? 7 : currentDayId;

  const renderSlotCard = (
    dayId: number,
    slotType: 'comida' | 'cena',
    requirement: MealRequirement
  ) => {
    const slotKey = `day_${dayId}_${slotType}`;
    const slot = currentWeekPlan.slots[slotKey] as SlotSelection | undefined;
    const isComida = slotType === 'comida';

    const pLabel = PROTEIN_LABELS[requirement.protein];
    const cLabel = CARB_LABELS[requirement.carb];
    const vLabel = VEG_LABELS[requirement.veg];

    const primaryDish = slot?.primaryDishId ? dishesMap[slot.primaryDishId] : undefined;
    const sideDish = slot?.sideDishId ? dishesMap[slot.sideDishId] : undefined;
    const starterDish = slot?.starterDishId ? dishesMap[slot.starterDishId] : undefined;

    const comboEval = evaluateComboMatch(primaryDish, sideDish, starterDish, requirement);
    const hasSelection = Boolean(slot && (slot.primaryDishId || slot.customNote || slot.isFreeMeal));

    return (
      <div
        className={`rounded-2xl p-3 sm:p-3.5 transition-all flex flex-col justify-between border ${
          hasSelection
            ? slot?.completed
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-white border-stone-200 shadow-xs hover:border-amber-300'
            : 'bg-stone-50/70 border-dashed border-stone-300 hover:bg-amber-50/40 hover:border-amber-400'
        }`}
      >
        {/* Slot Title & Combo Requirements Header */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5">
              {isComida ? (
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                {isComida ? 'Comida' : 'Cena'}
              </span>
            </div>

            {/* Quick Roulette trigger for this specific slot */}
            <button
              onClick={() => onOpenRoulette(dayId, slotType)}
              title="Girar ruleta para este turno"
              className="text-stone-400 hover:text-amber-600 hover:bg-amber-50 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>

          {/* Required Combo Badges */}
          <div className="flex flex-wrap items-center gap-1 mb-2.5">
            <span
              title={`Proteína requerida: ${pLabel.name}`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${pLabel.badgeClass}`}
            >
              <span>{pLabel.icon}</span>
              <span className="truncate max-w-[90px]">{pLabel.name.split('/')[0]}</span>
            </span>

            <span
              title={`Carbohidrato requerido: ${cLabel.name}`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${cLabel.badgeClass}`}
            >
              <span>{cLabel.icon}</span>
              <span className="truncate max-w-[80px]">{cLabel.name.split('/')[0]}</span>
            </span>

            <span
              title={`Verdura requerida: ${vLabel.name}`}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${vLabel.badgeClass}`}
            >
              <span>{vLabel.icon}</span>
              <span className="truncate max-w-[80px]">{vLabel.name.replace('Verdura de ', '')}</span>
            </span>
          </div>

          {/* Dish Selection State */}
          {hasSelection ? (
            <div className="space-y-1.5 my-1">
              {slot?.isFreeMeal ? (
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-1.5 text-purple-900 font-semibold text-xs">
                    <span>🍕</span>
                    <span>{slot.customNote || 'Comida libre / Fuera de casa'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {starterDish && (
                    <div className="text-xs text-stone-600 flex items-center gap-1 font-medium bg-stone-100 px-2 py-1 rounded-lg">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">1º</span>
                      <span className="truncate">{starterDish.name}</span>
                    </div>
                  )}

                  {primaryDish && (
                    <div className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2">
                      {primaryDish.name}
                    </div>
                  )}

                  {sideDish && (
                    <div className="text-xs text-amber-900 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-amber-700 font-bold uppercase">+ Guarnición:</span>
                      <span className="truncate">{sideDish.name}</span>
                    </div>
                  )}

                  {slot?.customNote && !slot.isFreeMeal && (
                    <div className="text-[11px] text-stone-500 italic">
                      Nota: {slot.customNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onSelectSlot(dayId, slotType)}
              className="w-full py-3 px-2 rounded-xl bg-white/70 hover:bg-amber-500/10 border border-stone-200 hover:border-amber-400 text-stone-600 hover:text-amber-800 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 group cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600 group-hover:scale-125 transition-transform" />
              <span>Decidir {isComida ? 'comida' : 'cena'}</span>
            </button>
          )}
        </div>

        {/* Slot Bottom Controls */}
        {hasSelection && (
          <div className="pt-2.5 mt-1 border-t border-stone-100 flex items-center justify-between gap-1">
            {/* Mark as completed / eaten */}
            <button
              onClick={() => onToggleCompleteSlot(slotKey)}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                slot?.completed
                  ? 'text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
              title={slot?.completed ? 'Marcar como pendiente' : 'Marcar como cocinado/comido'}
            >
              {slot?.completed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Comido</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-stone-400" />
                  <span>Pendiente</span>
                </>
              )}
            </button>

            {/* Edit & delete buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectSlot(dayId, slotType)}
                className="p-1 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Cambiar plato"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onClearSlot(slotKey)}
                className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Quitar selección"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Informative helper banner */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-400/10 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Pauta Gastronómica Flexible
            </h3>
            <p className="text-xs text-stone-600">
              Cada comida y cena tiene asignado un combo nutricional clave (Proteína + Carbohidrato + Verdura). Al hacer clic en un turno, la app te muestra qué platos de casa encajan a la perfección.
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3.5">
        {blueprint.map((day) => {
          const isToday = day.dayId === currentDayId;
          const comidaKey = `day_${day.dayId}_comida`;
          const cenaKey = `day_${day.dayId}_cena`;
          const comidaCompleted = currentWeekPlan.slots[comidaKey]?.completed;
          const cenaCompleted = currentWeekPlan.slots[cenaKey]?.completed;

          return (
            <div
              key={day.dayId}
              className={`flex flex-col rounded-3xl p-3 sm:p-3.5 transition-all ${
                isToday
                  ? 'bg-amber-100/50 ring-2 ring-amber-500/80 shadow-md'
                  : 'bg-white border border-stone-200/90 shadow-xs'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-stone-900 text-base">
                    {day.dayName}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse uppercase tracking-wider">
                      Hoy
                    </span>
                  )}
                </div>

                {comidaCompleted && cenaCompleted && (
                  <span
                    title="Día completado"
                    className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Day slots: Comida & Cena */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                {renderSlotCard(day.dayId, 'comida', day.comida)}
                {renderSlotCard(day.dayId, 'cena', day.cena)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
