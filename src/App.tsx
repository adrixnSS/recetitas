import React, { useState, useEffect } from 'react';
import {
  DayCombo,
  WeekPlan,
  Dish,
  SlotSelection,
} from './types/meal';
import {
  loadDishes,
  saveDishes,
  loadBlueprint,
  saveBlueprint,
  loadCurrentWeekPlan,
  saveCurrentWeekPlan,
  getMondayOfCurrentWeek,
  formatWeekLabel,
  getInitialWeekPlan,
} from './utils/storage';
import { Header } from './components/Header';
import { WeeklyBoard } from './components/WeeklyBoard';
import { MealDecisionModal } from './components/MealDecisionModal';
import { RouletteModal } from './components/RouletteModal';
import { DishesCatalog } from './components/DishesCatalog';
import { NutritionBalance } from './components/NutritionBalance';
import { ShoppingList } from './components/ShoppingList';
import { TemplateCustomizer } from './components/TemplateCustomizer';
import {
  Sparkles,
  Dices,
  Sun,
  Moon,
  CheckCircle2,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import { PROTEIN_LABELS, CARB_LABELS, VEG_LABELS } from './utils/matching';

export default function App() {
  const [dishes, setDishes] = useState<Dish[]>(() => loadDishes());
  const [blueprint, setBlueprint] = useState<DayCombo[]>(() => loadBlueprint());
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeekPlan>(() => loadCurrentWeekPlan());
  const [currentTab, setCurrentTab] = useState<
    'board' | 'today' | 'catalog' | 'balance' | 'groceries' | 'template'
  >('board');

  // Decision Modal state
  const [decisionModal, setDecisionModal] = useState<{
    isOpen: boolean;
    dayId: number;
    slotType: 'comida' | 'cena';
  }>({
    isOpen: false,
    dayId: 1,
    slotType: 'comida',
  });

  // Roulette Modal state
  const [rouletteModal, setRouletteModal] = useState<{
    isOpen: boolean;
    dayId: number;
    slotType: 'comida' | 'cena';
  }>({
    isOpen: false,
    dayId: 1,
    slotType: 'comida',
  });

  // Today calculation
  const todayDate = new Date();
  let currentDayId = todayDate.getDay();
  currentDayId = currentDayId === 0 ? 7 : currentDayId;
  const currentHour = todayDate.getHours();
  const currentSlotType: 'comida' | 'cena' = currentHour >= 16 ? 'cena' : 'comida';
  const todaySlotKey = `day_${currentDayId}_${currentSlotType}`;
  const todayCombo = blueprint.find((b) => b.dayId === currentDayId);
  const todayRequirement = todayCombo ? todayCombo[currentSlotType] : undefined;
  const todaySlotSelection = currentWeekPlan.slots[todaySlotKey];

  const dishesMap = React.useMemo(() => {
    const map: Record<string, Dish> = {};
    dishes.forEach((d) => (map[d.id] = d));
    return map;
  }, [dishes]);

  // Handlers
  const handleSaveSlot = (slotKey: string, selection: SlotSelection) => {
    const updatedPlan: WeekPlan = {
      ...currentWeekPlan,
      slots: {
        ...currentWeekPlan.slots,
        [slotKey]: selection,
      },
    };
    setCurrentWeekPlan(updatedPlan);
    saveCurrentWeekPlan(updatedPlan);
  };

  const handleClearSlot = (slotKey: string) => {
    const updatedSlots = { ...currentWeekPlan.slots };
    delete updatedSlots[slotKey];
    const updatedPlan = {
      ...currentWeekPlan,
      slots: updatedSlots,
    };
    setCurrentWeekPlan(updatedPlan);
    saveCurrentWeekPlan(updatedPlan);
  };

  const handleToggleCompleteSlot = (slotKey: string) => {
    const slot = currentWeekPlan.slots[slotKey];
    if (!slot) return;
    const updatedPlan = {
      ...currentWeekPlan,
      slots: {
        ...currentWeekPlan.slots,
        [slotKey]: {
          ...slot,
          completed: !slot.completed,
        },
      },
    };
    setCurrentWeekPlan(updatedPlan);
    saveCurrentWeekPlan(updatedPlan);
  };

  const handleResetWeek = () => {
    if (confirm('¿Vaciar la planificación de comidas de esta semana para empezar de nuevo?')) {
      const emptyPlan: WeekPlan = {
        id: `week_${getMondayOfCurrentWeek()}`,
        startDate: getMondayOfCurrentWeek(),
        weekLabel: formatWeekLabel(getMondayOfCurrentWeek()),
        slots: {},
      };
      setCurrentWeekPlan(emptyPlan);
      saveCurrentWeekPlan(emptyPlan);
    }
  };

  const handleUpdateDishes = (newDishes: Dish[]) => {
    setDishes(newDishes);
    saveDishes(newDishes);
  };

  const handleUpdateBlueprint = (newBp: DayCombo[]) => {
    setBlueprint(newBp);
    saveBlueprint(newBp);
  };

  const openDecisionModal = (dayId: number, slotType: 'comida' | 'cena') => {
    setDecisionModal({
      isOpen: true,
      dayId,
      slotType,
    });
  };

  const openRoulette = (dayId: number, slotType: 'comida' | 'cena') => {
    setRouletteModal({
      isOpen: true,
      dayId,
      slotType,
    });
  };

  const openQuickDecideToday = () => {
    openDecisionModal(currentDayId, currentSlotType);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-amber-200 selection:text-amber-900">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentWeekPlan={currentWeekPlan}
        blueprint={blueprint}
        dishes={dishes}
        onResetWeek={handleResetWeek}
        onOpenQuickDecide={openQuickDecideToday}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Today's Culinary Decision Focus Banner */}
        {todayCombo && todayRequirement && currentTab === 'board' && (
          <div className="bg-linear-to-r from-orange-500 via-amber-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-orange-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-black uppercase tracking-wider">
                  Hoy {todayCombo.dayName}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-100">
                  {currentSlotType === 'comida' ? (
                    <>
                      <Sun className="w-3.5 h-3.5" /> Turno de Almuerzo / Comida
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5" /> Turno de Cena
                    </>
                  )}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-black tracking-tight">
                {todaySlotSelection?.primaryDishId ? (
                  <div className="flex items-center gap-2">
                    <span>
                      Hoy comemos:{' '}
                      <span className="underline decoration-amber-300">
                        {dishesMap[todaySlotSelection.primaryDishId]?.name || 'Plato seleccionado'}
                      </span>
                    </span>
                    {todaySlotSelection.completed && (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ¡Comido!
                      </span>
                    )}
                  </div>
                ) : todaySlotSelection?.isFreeMeal ? (
                  <span>
                    Plan para hoy:{' '}
                    <span className="italic">{todaySlotSelection.customNote || 'Comida libre'}</span>
                  </span>
                ) : (
                  <span>¿Qué os apetece hoy para {currentSlotType}?</span>
                )}
              </div>

              {/* Required combo preview */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-amber-100 font-medium">
                <span>Combo asignado:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                  {PROTEIN_LABELS[todayRequirement.protein].icon}{' '}
                  {PROTEIN_LABELS[todayRequirement.protein].name.split('/')[0]}
                </span>
                <span>+</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                  {CARB_LABELS[todayRequirement.carb].icon}{' '}
                  {CARB_LABELS[todayRequirement.carb].name.split('/')[0]}
                </span>
                <span>+</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                  {VEG_LABELS[todayRequirement.veg].icon}{' '}
                  {VEG_LABELS[todayRequirement.veg].name.replace('Verdura de ', '')}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={openQuickDecideToday}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white text-orange-700 font-extrabold text-xs sm:text-sm shadow-md hover:bg-amber-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>
                  {todaySlotSelection?.primaryDishId ? 'Cambiar plato' : 'Elegir opciones hoy'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => openRoulette(currentDayId, currentSlotType)}
                title="Girar la ruleta gastronómica para hoy"
                className="p-2.5 rounded-2xl bg-orange-700/60 hover:bg-orange-700 text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Dices className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Weekly Board (La Pauta Semanal) */}
        {currentTab === 'board' && (
          <WeeklyBoard
            blueprint={blueprint}
            currentWeekPlan={currentWeekPlan}
            dishes={dishes}
            onSelectSlot={openDecisionModal}
            onClearSlot={handleClearSlot}
            onToggleCompleteSlot={handleToggleCompleteSlot}
            onOpenRoulette={openRoulette}
          />
        )}

        {/* Tab 2: Dishes Catalog */}
        {currentTab === 'catalog' && (
          <DishesCatalog dishes={dishes} onSaveDishes={handleUpdateDishes} />
        )}

        {/* Tab 3: Nutrition Balance */}
        {currentTab === 'balance' && (
          <NutritionBalance
            currentWeekPlan={currentWeekPlan}
            blueprint={blueprint}
            dishes={dishes}
          />
        )}

        {/* Tab 4: Shopping List */}
        {currentTab === 'groceries' && (
          <ShoppingList
            currentWeekPlan={currentWeekPlan}
            blueprint={blueprint}
            dishes={dishes}
          />
        )}

        {/* Tab 5: Template Blueprint Customizer */}
        {currentTab === 'template' && (
          <TemplateCustomizer
            blueprint={blueprint}
            onSaveBlueprint={handleUpdateBlueprint}
          />
        )}
      </main>

      {/* Decision Engine Modal */}
      {decisionModal.isOpen && (
        <MealDecisionModal
          isOpen={decisionModal.isOpen}
          onClose={() => setDecisionModal((prev) => ({ ...prev, isOpen: false }))}
          dayId={decisionModal.dayId}
          slotType={decisionModal.slotType}
          blueprint={blueprint}
          dishes={dishes}
          currentSlotSelection={
            currentWeekPlan.slots[`day_${decisionModal.dayId}_${decisionModal.slotType}`]
          }
          onSaveSlot={handleSaveSlot}
          onOpenRoulette={openRoulette}
        />
      )}

      {/* Roulette Modal */}
      {rouletteModal.isOpen && (
        <RouletteModal
          isOpen={rouletteModal.isOpen}
          onClose={() => setRouletteModal((prev) => ({ ...prev, isOpen: false }))}
          dayId={rouletteModal.dayId}
          slotType={rouletteModal.slotType}
          blueprint={blueprint}
          dishes={dishes}
          onSaveSlot={handleSaveSlot}
        />
      )}
    </div>
  );
}
