import React from 'react';
import { WeekPlan, Dish, DayCombo } from '../types/meal';
import { TARGET_NUTRITION_FREQUENCIES } from '../data/weeklyBlueprint';
import { PieChart, CheckCircle2, AlertCircle, Info, Sparkles, Trophy } from 'lucide-react';

interface NutritionBalanceProps {
  currentWeekPlan: WeekPlan;
  blueprint: DayCombo[];
  dishes: Dish[];
}

export const NutritionBalance: React.FC<NutritionBalanceProps> = ({
  currentWeekPlan,
  blueprint,
  dishes,
}) => {
  const dishesMap = React.useMemo(() => {
    const map: Record<string, Dish> = {};
    dishes.forEach((d) => (map[d.id] = d));
    return map;
  }, [dishes]);

  // Compute counts from the current week plan
  const counts = React.useMemo(() => {
    const res = {
      carne: 0,
      pescado: 0,
      huevo: 0,
      legumbre: 0,
      arroz_pasta: 0,
      tuberculo: 0,
      hoja: 0,
      cocida: 0,
      totalSlotsFilled: 0,
    };

    blueprint.forEach((day) => {
      ['comida', 'cena'].forEach((type) => {
        const slotKey = `day_${day.dayId}_${type}`;
        const slot = currentWeekPlan.slots[slotKey];
        if (!slot) return;

        if (slot.isFreeMeal) {
          res.totalSlotsFilled++;
          return;
        }

        const slotDishes = [
          slot.primaryDishId ? dishesMap[slot.primaryDishId] : null,
          slot.sideDishId ? dishesMap[slot.sideDishId] : null,
          slot.starterDishId ? dishesMap[slot.starterDishId] : null,
        ].filter(Boolean) as Dish[];

        if (slotDishes.length > 0) {
          res.totalSlotsFilled++;

          // Check unique nutrient occurrences in this meal
          const proteinsInMeal = new Set<string>();
          const carbsInMeal = new Set<string>();
          const vegInMeal = new Set<string>();

          slotDishes.forEach((d) => {
            d.proteins.forEach((p) => proteinsInMeal.add(p));
            d.carbs.forEach((c) => carbsInMeal.add(c));
            d.veggies.forEach((v) => vegInMeal.add(v));
          });

          if (proteinsInMeal.has('carne')) res.carne++;
          if (proteinsInMeal.has('pescado')) res.pescado++;
          if (proteinsInMeal.has('huevo')) res.huevo++;
          if (proteinsInMeal.has('legumbre')) res.legumbre++;

          if (carbsInMeal.has('arroz_pasta')) res.arroz_pasta++;
          if (carbsInMeal.has('tuberculo')) res.tuberculo++;

          if (vegInMeal.has('hoja')) res.hoja++;
          if (vegInMeal.has('cocida')) res.cocida++;
        }
      });
    });

    return res;
  }, [currentWeekPlan, blueprint, dishesMap]);

  const renderMeter = (
    title: string,
    current: number,
    min: number,
    max: number,
    icon: string,
    unit: string
  ) => {
    const isOptimal = current >= min && current <= max;
    const isUnder = current < min;
    const isOver = current > max;
    const percentage = Math.min(Math.round((current / max) * 100), 100);

    return (
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="font-bold text-stone-900 text-sm">{title}</span>
            </div>

            {isOptimal && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Óptimo</span>
              </span>
            )}
            {isUnder && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                <span>Faltan {min - current}</span>
              </span>
            )}
            {isOver && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                <span>Completado</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between text-xs text-stone-500 mb-1.5">
            <span>
              Actual: <strong className="text-stone-900 text-sm">{current}</strong> veces
            </span>
            <span>
              Meta: {min}-{max} {unit}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOptimal
                  ? 'bg-emerald-500'
                  : isUnder
                  ? 'bg-amber-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-linear-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 rounded-3xl p-5 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              Balanza Nutricional Familiar
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Control de frecuencias semanales según la pauta que habéis definido en casa para una alimentación equilibrada y variada.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-amber-200 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-xs">
            {counts.totalSlotsFilled}/14
          </div>
          <div className="text-xs">
            <div className="font-extrabold text-stone-900">Turnos Planificados</div>
            <div className="text-stone-500 text-[11px]">de 14 comidas y cenas</div>
          </div>
        </div>
      </div>

      {/* Section 1: Proteínas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <span>🥩</span>
            <span>Proteínas (Todos los días)</span>
          </h3>
          <span className="text-xs text-stone-500">Reparto ideal semanal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.protein.carne.label,
            counts.carne,
            TARGET_NUTRITION_FREQUENCIES.protein.carne.min,
            TARGET_NUTRITION_FREQUENCIES.protein.carne.max,
            TARGET_NUTRITION_FREQUENCIES.protein.carne.icon,
            'x semana'
          )}

          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.protein.pescado.label,
            counts.pescado,
            TARGET_NUTRITION_FREQUENCIES.protein.pescado.min,
            TARGET_NUTRITION_FREQUENCIES.protein.pescado.max,
            TARGET_NUTRITION_FREQUENCIES.protein.pescado.icon,
            'x semana'
          )}

          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.protein.legumbre.label,
            counts.legumbre,
            TARGET_NUTRITION_FREQUENCIES.protein.legumbre.min,
            TARGET_NUTRITION_FREQUENCIES.protein.legumbre.max,
            TARGET_NUTRITION_FREQUENCIES.protein.legumbre.icon,
            'x semana'
          )}

          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.protein.huevo.label,
            counts.huevo,
            TARGET_NUTRITION_FREQUENCIES.protein.huevo.min,
            TARGET_NUTRITION_FREQUENCIES.protein.huevo.max,
            TARGET_NUTRITION_FREQUENCIES.protein.huevo.icon,
            'x semana'
          )}
        </div>
      </div>

      {/* Section 2: Carbohidratos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <span>🍚</span>
            <span>Carbohidratos (Energía diaria)</span>
          </h3>
          <span className="text-xs text-stone-500">Arroz/Pasta y Tubérculos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.carb.arroz_pasta.label,
            counts.arroz_pasta,
            TARGET_NUTRITION_FREQUENCIES.carb.arroz_pasta.min,
            TARGET_NUTRITION_FREQUENCIES.carb.arroz_pasta.max,
            TARGET_NUTRITION_FREQUENCIES.carb.arroz_pasta.icon,
            'x semana'
          )}

          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.carb.tuberculo.label,
            counts.tuberculo,
            TARGET_NUTRITION_FREQUENCIES.carb.tuberculo.min,
            TARGET_NUTRITION_FREQUENCIES.carb.tuberculo.max,
            TARGET_NUTRITION_FREQUENCIES.carb.tuberculo.icon,
            'x semana'
          )}
        </div>
      </div>

      {/* Section 3: Verduras y Hortalizas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <span>🥦</span>
            <span>Verduras y Hortalizas (2 veces al día)</span>
          </h3>
          <span className="text-xs text-stone-500">Comida y cena</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.veg.hoja.label,
            counts.hoja,
            TARGET_NUTRITION_FREQUENCIES.veg.hoja.min,
            TARGET_NUTRITION_FREQUENCIES.veg.hoja.max,
            TARGET_NUTRITION_FREQUENCIES.veg.hoja.icon,
            'x semana'
          )}

          {renderMeter(
            TARGET_NUTRITION_FREQUENCIES.veg.cocida.label,
            counts.cocida,
            TARGET_NUTRITION_FREQUENCIES.veg.cocida.min,
            TARGET_NUTRITION_FREQUENCIES.veg.cocida.max,
            TARGET_NUTRITION_FREQUENCIES.veg.cocida.icon,
            'x semana'
          )}
        </div>
      </div>

      {/* Insight banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 space-y-1">
          <p className="font-bold">¿Cómo garantiza la tabla semanal este equilibrio?</p>
          <p>
            Vuestra cuadrícula semanal ya está calibrada para que, siguiendo los combos asignados a cada día, se cumplan exactamente estos rangos saludables sin tener que calcular calorías ni gramos.
          </p>
        </div>
      </div>
    </div>
  );
};
