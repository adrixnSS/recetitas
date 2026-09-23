import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  BookOpen,
  PieChart,
  ShoppingCart,
  Share2,
  Check,
  RotateCcw,
  UtensilsCrossed,
  Sliders,
} from 'lucide-react';
import { WeekPlan, DayCombo, Dish } from '../types/meal';
import { generateWhatsAppSummary } from '../utils/storage';

interface HeaderProps {
  currentTab: 'board' | 'today' | 'catalog' | 'balance' | 'groceries' | 'template';
  setCurrentTab: (tab: 'board' | 'today' | 'catalog' | 'balance' | 'groceries' | 'template') => void;
  currentWeekPlan: WeekPlan;
  blueprint: DayCombo[];
  dishes: Dish[];
  onResetWeek: () => void;
  onOpenQuickDecide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentWeekPlan,
  blueprint,
  dishes,
  onResetWeek,
  onOpenQuickDecide,
}) => {
  const [copied, setCopied] = useState(false);

  const dishesMap = React.useMemo(() => {
    const map: Record<string, Dish> = {};
    dishes.forEach((d) => (map[d.id] = d));
    return map;
  }, [dishes]);

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppSummary(blueprint, currentWeekPlan, dishesMap);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Determine current day of the week (1: Monday, ..., 7: Sunday)
  const todayDate = new Date();
  let currentDayId = todayDate.getDay();
  currentDayId = currentDayId === 0 ? 7 : currentDayId; // JS 0 is Sunday
  const currentHour = todayDate.getHours();
  const isCenaTime = currentHour >= 16; // After 4pm suggest dinner
  const currentSlotKey = `day_${currentDayId}_${isCenaTime ? 'cena' : 'comida'}`;
  const currentDayCombo = blueprint.find((b) => b.dayId === currentDayId);
  const currentSlotSelection = currentWeekPlan.slots[currentSlotKey];

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 font-sans">
                  Menú Familiar
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Semana {currentWeekPlan.weekLabel}
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Decisor gastronómico flexible: sigue la pauta nutricional improvisando platos a vuestro gusto
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick decide for today button */}
            <button
              onClick={onOpenQuickDecide}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>¿Qué comemos hoy?</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleCopyWhatsApp}
              title="Copiar menú formateado para WhatsApp"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </>
              )}
            </button>

            {/* Reset week */}
            <button
              onClick={onResetWeek}
              title="Limpiar selecciones de la semana actual"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => setCurrentTab('board')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'board'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Pauta Semanal</span>
          </button>

          <button
            onClick={() => setCurrentTab('catalog')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'catalog'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Recetario de Casa ({dishes.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('balance')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'balance'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Balanza Nutricional</span>
          </button>

          <button
            onClick={() => setCurrentTab('groceries')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'groceries'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Lista de la Compra</span>
          </button>

          <button
            onClick={() => setCurrentTab('template')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'template'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Plantilla de Combos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
