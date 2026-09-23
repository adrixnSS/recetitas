import React from 'react';
import { DayCombo, ProteinType, CarbType, VegType } from '../types/meal';
import {
  PROTEIN_LABELS,
  CARB_LABELS,
  VEG_LABELS,
} from '../utils/matching';
import { Sliders, RotateCcw, Info, Check } from 'lucide-react';
import { DEFAULT_WEEKLY_BLUEPRINT } from '../data/weeklyBlueprint';

interface TemplateCustomizerProps {
  blueprint: DayCombo[];
  onSaveBlueprint: (bp: DayCombo[]) => void;
}

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  blueprint,
  onSaveBlueprint,
}) => {
  const handleUpdateSlot = (
    dayId: number,
    slotType: 'comida' | 'cena',
    field: 'protein' | 'carb' | 'veg',
    value: string
  ) => {
    const updated = blueprint.map((day) => {
      if (day.dayId === dayId) {
        return {
          ...day,
          [slotType]: {
            ...day[slotType],
            [field]: value,
          },
        };
      }
      return day;
    });
    onSaveBlueprint(updated);
  };

  const handleReset = () => {
    if (confirm('¿Restablecer la plantilla de combos a la hoja de cálculo original?')) {
      onSaveBlueprint(DEFAULT_WEEKLY_BLUEPRINT);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-500" />
            <span>Plantilla Semanal de Combos</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Comidas a la izquierda y cenas a la derecha con el combo individual [Proteína] + [Carbohidrato] + [Verdura].
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs font-semibold border border-stone-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Original</span>
        </button>
      </div>

      <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          Esta es la regla maestra que rige la decisión familiar. Cuando alguien elige qué cocinar en un día concreto, el sistema le ofrecerá automáticamente los platos compatibles con estas opciones.
        </p>
      </div>

      {/* 7 Days Table / Cards */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-stone-200">
          {blueprint.map((day) => (
            <div key={day.dayId} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Day title */}
              <div className="lg:w-32 shrink-0">
                <span className="text-sm font-extrabold text-stone-900 uppercase tracking-wide">
                  {day.dayName}
                </span>
              </div>

              {/* Comida combo (Left) */}
              <div className="flex-1 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <span>☀️ Comida:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Proteína</label>
                    <select
                      value={day.comida.protein}
                      onChange={(e) => handleUpdateSlot(day.dayId, 'comida', 'protein', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-amber-200 bg-white text-stone-800 font-medium"
                    >
                      <option value="carne">🍗 Carne magra / Aves</option>
                      <option value="pescado">🐟 Pescado</option>
                      <option value="huevo">🥚 Huevo</option>
                      <option value="legumbre">🫘 Legumbre</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Carbohidrato</label>
                    <select
                      value={day.comida.carb}
                      onChange={(e) => handleUpdateSlot(day.dayId, 'comida', 'carb', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-amber-200 bg-white text-stone-800 font-medium"
                    >
                      <option value="arroz_pasta">🍚 Arroz y Pasta</option>
                      <option value="tuberculo">🥔 Patata y Boniato</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Verdura</label>
                    <select
                      value={day.comida.veg}
                      onChange={(e) => handleUpdateSlot(day.dayId, 'comida', 'veg', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-amber-200 bg-white text-stone-800 font-medium"
                    >
                      <option value="hoja">🥬 De Hoja Verde</option>
                      <option value="cocida">🥕 Cocinadas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cena combo (Right) */}
              <div className="flex-1 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200/80 space-y-2">
                <div className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                  <span>🌙 Cena:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Proteína</label>
                    <select
                      value={day.cena.protein}
                      onChange={(e) => handleUpdateSlot(day.dayId, 'cena', 'protein', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-indigo-200 bg-white text-stone-800 font-medium"
                    >
                      <option value="carne">🍗 Carne magra / Aves</option>
                      <option value="pescado">🐟 Pescado</option>
                      <option value="huevo">🥚 Huevo</option>
                      <option value="legumbre">🫘 Legumbre</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Carbohidrato</label>
                    <select
                      value={day.cena.carb}
                      onChange={(e) => handleUpdateSlot(day.dayId, 'cena', 'carb', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-indigo-200 bg-white text-stone-800 font-medium"
                    >
                      <option value="arroz_pasta">🍚 Arroz y Pasta</option>
                      <option value="tuberculo">🥔 Patata y Boniato</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Verdura</label>
                    <select
                      value={day.cena.veg}
                      onChange={(e) => handleUpdateSlot(day.dayId, 'cena', 'veg', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-indigo-200 bg-white text-stone-800 font-medium"
                    >
                      <option value="hoja">🥬 De Hoja Verde</option>
                      <option value="cocida">🥕 Cocinadas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
