import React, { useState, useMemo } from 'react';
import {
  DayCombo,
  Dish,
  MealRequirement,
  SlotSelection,
} from '../types/meal';
import {
  PROTEIN_LABELS,
  CARB_LABELS,
  VEG_LABELS,
  getRecommendedDishesForRequirement,
  evaluateDishMatch,
  evaluateComboMatch,
} from '../utils/matching';
import {
  X,
  Sparkles,
  CheckCircle2,
  Check,
  Search,
  Clock,
  Dices,
  Plus,
  Utensils,
  ChevronRight,
  Flame,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MealDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: number;
  slotType: 'comida' | 'cena';
  blueprint: DayCombo[];
  dishes: Dish[];
  currentSlotSelection?: SlotSelection;
  onSaveSlot: (slotKey: string, selection: SlotSelection) => void;
  onOpenRoulette: (dayId: number, slotType: 'comida' | 'cena') => void;
}

export const MealDecisionModal: React.FC<MealDecisionModalProps> = ({
  isOpen,
  onClose,
  dayId,
  slotType,
  blueprint,
  dishes,
  currentSlotSelection,
  onSaveSlot,
  onOpenRoulette,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'builder' | 'free'>('matches');
  const [searchTerm, setSearchTerm] = useState('');

  // Builder states
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<string>(
    currentSlotSelection?.primaryDishId || ''
  );
  const [selectedSideId, setSelectedSideId] = useState<string>(
    currentSlotSelection?.sideDishId || ''
  );
  const [selectedStarterId, setSelectedStarterId] = useState<string>(
    currentSlotSelection?.starterDishId || ''
  );
  const [customNote, setCustomNote] = useState<string>(
    currentSlotSelection?.customNote || ''
  );

  // Free meal note
  const [freeMealText, setFreeMealText] = useState<string>(
    currentSlotSelection?.isFreeMeal ? currentSlotSelection?.customNote || 'Cena libre / Pizza' : 'Pizza o comida fuera'
  );

  // Day & Requirement
  const day = blueprint.find((b) => b.dayId === dayId);
  const requirement: MealRequirement | undefined = day ? day[slotType] : undefined;

  // Sync state if modal opens with existing selection
  React.useEffect(() => {
    if (isOpen) {
      if (currentSlotSelection?.isFreeMeal) {
        setActiveTab('free');
        setFreeMealText(currentSlotSelection.customNote || 'Comida libre / Fuera');
      } else {
        setActiveTab('matches');
        setSelectedPrimaryId(currentSlotSelection?.primaryDishId || '');
        setSelectedSideId(currentSlotSelection?.sideDishId || '');
        setSelectedStarterId(currentSlotSelection?.starterDishId || '');
        setCustomNote(currentSlotSelection?.customNote || '');
      }
      setSearchTerm('');
    }
  }, [isOpen, currentSlotSelection]);

  const dishesMap = useMemo(() => {
    const map: Record<string, Dish> = {};
    dishes.forEach((d) => (map[d.id] = d));
    return map;
  }, [dishes]);

  // Candidates categorized for this requirement
  const recommendations = useMemo(() => {
    if (!requirement) {
      return {
        fullMatches: [],
        proteinMatches: [],
        carbComplements: [],
        vegComplements: [],
        allEligible: [],
      };
    }
    return getRecommendedDishesForRequirement(dishes, requirement);
  }, [dishes, requirement]);

  if (!isOpen || !day || !requirement) return null;

  const slotKey = `day_${dayId}_${slotType}`;
  const pLabel = PROTEIN_LABELS[requirement.protein];
  const cLabel = CARB_LABELS[requirement.carb];
  const vLabel = VEG_LABELS[requirement.veg];

  // Evaluate current combo in builder
  const primaryDish = selectedPrimaryId ? dishesMap[selectedPrimaryId] : undefined;
  const sideDish = selectedSideId ? dishesMap[selectedSideId] : undefined;
  const starterDish = selectedStarterId ? dishesMap[selectedStarterId] : undefined;
  const comboStatus = evaluateComboMatch(primaryDish, sideDish, starterDish, requirement);

  const handleSelectSingleDish = (dish: Dish) => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore if not supported
    }

    onSaveSlot(slotKey, {
      primaryDishId: dish.id,
      sideDishId: undefined,
      starterDishId: undefined,
      customNote: '',
      isFreeMeal: false,
      completed: false,
    });
    onClose();
  };

  const handleSaveBuilder = () => {
    if (!selectedPrimaryId && !selectedStarterId) return;

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    onSaveSlot(slotKey, {
      primaryDishId: selectedPrimaryId || undefined,
      sideDishId: selectedSideId || undefined,
      starterDishId: selectedStarterId || undefined,
      customNote: customNote.trim() || undefined,
      isFreeMeal: false,
      completed: false,
    });
    onClose();
  };

  const handleSaveFreeMeal = () => {
    onSaveSlot(slotKey, {
      isFreeMeal: true,
      customNote: freeMealText.trim() || 'Comida libre / Fuera',
      completed: false,
    });
    onClose();
  };

  // Filter full matches by search
  const filteredMatches = recommendations.fullMatches.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dishes matching protein for the builder
  const proteinDishes = dishes.filter((d) => d.proteins.includes(requirement.protein));
  const carbDishes = dishes.filter(
    (d) =>
      d.carbs.includes(requirement.carb) &&
      (d.dishRole === 'guarnicion_complemento' || d.dishRole === 'primer_plato' || d.dishRole === 'plato_principal')
  );
  const vegDishes = dishes.filter(
    (d) =>
      d.veggies.includes(requirement.veg) &&
      (d.dishRole === 'guarnicion_complemento' || d.dishRole === 'primer_plato' || d.dishRole === 'plato_principal')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-amber-500/15 via-orange-500/10 to-amber-400/15 p-4 sm:p-5 border-b border-stone-200">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  {day.dayName}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {slotType === 'comida' ? '☀️ Almuerzo / Comida' : '🌙 Cena'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                Elegir menú para este turno
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Combo Requirement Display */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/80 shadow-xs">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Combo nutricional obligatorio para este turno:</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenRoulette(dayId, slotType);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>¿Indecisos? Tirar ruleta</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className={`p-2 rounded-xl border flex items-center gap-2 ${pLabel.badgeClass}`}>
                <span className="text-xl">{pLabel.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Proteína</div>
                  <div className="text-xs font-bold truncate">{pLabel.name}</div>
                </div>
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-2 ${cLabel.badgeClass}`}>
                <span className="text-xl">{cLabel.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Carbohidrato</div>
                  <div className="text-xs font-bold truncate">{cLabel.name}</div>
                </div>
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-2 ${vLabel.badgeClass}`}>
                <span className="text-xl">{vLabel.icon}</span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Verdura</div>
                  <div className="text-xs font-bold truncate">{vLabel.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matches'
                ? 'border-amber-500 text-amber-700 bg-white rounded-t-xl'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Platos Únicos ({recommendations.fullMatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'border-amber-500 text-amber-700 bg-white rounded-t-xl'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-orange-500" />
            <span>Armar Menú (Principal + Guarnición)</span>
          </button>

          <button
            onClick={() => setActiveTab('free')}
            className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'free'
                ? 'border-amber-500 text-amber-700 bg-white rounded-t-xl'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🍕</span>
            <span>Comodín / Libre</span>
          </button>
        </div>

        {/* Tab 1: Full Matches (Platos Únicos) */}
        {activeTab === 'matches' && (
          <div className="p-4 sm:p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar entre los platos compatibles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {filteredMatches.length > 0 ? (
              <div className="space-y-2.5">
                <p className="text-xs text-stone-500 font-medium">
                  Estos platos cubren el combo de hoy al 100% de manera autónoma. Haz clic para seleccionarlo:
                </p>

                {filteredMatches.map((dish) => {
                  const isCurrentlyChosen = currentSlotSelection?.primaryDishId === dish.id;

                  return (
                    <div
                      key={dish.id}
                      onClick={() => handleSelectSingleDish(dish)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrentlyChosen
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                          : 'bg-white border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 shadow-xs'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-sm sm:text-base group-hover:text-amber-900">
                            {dish.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            100% Match
                          </span>
                        </div>

                        {dish.description && (
                          <p className="text-xs text-stone-500 line-clamp-1">{dish.description}</p>
                        )}

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
                          {dish.prepTimeMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dish.prepTimeMinutes} min
                            </span>
                          )}
                          <span>
                            {dish.categoryHint || 'Plato familiar'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button className="px-3 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-transform group-hover:scale-105 flex items-center gap-1">
                          <span>Elegir</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-stone-200">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-stone-800 mb-1">
                  No hay un plato único directo con ese nombre
                </h4>
                <p className="text-xs text-stone-500 mb-3 max-w-sm mx-auto">
                  ¡No te preocupes! Puedes combinar un plato principal con una guarnición o ensalada en la pestaña "Armar Menú".
                </p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors"
                >
                  Ir a Armar Menú a Medida
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Combo Builder */}
        {activeTab === 'builder' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Live checklist */}
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200">
              <div className="text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                Estado del menú combinado:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div
                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                    comboStatus.hasProtein
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {comboStatus.hasProtein ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold">Proteína: {pLabel.name.split('/')[0]}</div>
                    <div className="text-[10px] text-stone-500 truncate">
                      {comboStatus.providedBy.protein || 'Falta seleccionar'}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                    comboStatus.hasCarb
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {comboStatus.hasCarb ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold">Carbohidrato: {cLabel.name.split('/')[0]}</div>
                    <div className="text-[10px] text-stone-500 truncate">
                      {comboStatus.providedBy.carb || 'Falta seleccionar'}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2 rounded-xl border flex items-center gap-2 ${
                    comboStatus.hasVeg
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {comboStatus.hasVeg ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold">Verdura: {vLabel.name.replace('Verdura de ', '')}</div>
                    <div className="text-[10px] text-stone-500 truncate">
                      {comboStatus.providedBy.veg || 'Falta seleccionar'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Select 1: Plato Principal */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                1. Plato Principal (Proteína: {pLabel.name})
              </label>
              <select
                value={selectedPrimaryId}
                onChange={(e) => setSelectedPrimaryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50 bg-white"
              >
                <option value="">-- Seleccionar plato principal --</option>
                {proteinDishes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.dishRole === 'plato_unico' ? '(Completo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Select 2: Guarnición / Carbohidrato */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                2. Guarnición o Acompañamiento ({cLabel.name})
              </label>
              <select
                value={selectedSideId}
                onChange={(e) => setSelectedSideId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50 bg-white"
              >
                <option value="">-- Ninguna / Ya incluida en el principal --</option>
                {carbDishes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select 3: Primer plato o Verdura */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                3. Verdura o Primer Plato ({vLabel.name})
              </label>
              <select
                value={selectedStarterId}
                onChange={(e) => setSelectedStarterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50 bg-white"
              >
                <option value="">-- Ninguno / Ya incluida en el plato principal --</option>
                {vegDishes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                Nota o detalle opcional
              </label>
              <input
                type="text"
                placeholder="Ej: Con salsa aparte, dejar descongelando la noche antes..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Free / Comodín Meal */}
        {activeTab === 'free' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
              <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                <span>🍕</span>
                <span>Modo Comodín / Libertad Familiar</span>
              </h4>
              <p className="text-xs text-purple-800">
                La improvisación es parte de la vida familiar. Si hoy vais a cenar pizza, tenéis un cumpleaños, vais a un restaurante o toca terminar sobras de la nevera, márcalo aquí sin culpas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                ¿Qué se va a comer?
              </label>
              <input
                type="text"
                value={freeMealText}
                onChange={(e) => setFreeMealText(e.target.value)}
                placeholder="Ej: Pizza casera, Cena en casa de los abuelos, Sobras..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {['Pizza casera', 'Comida en restaurante', 'Sobras del día anterior', 'Picoteo / Cena fría'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFreeMealText(opt)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {activeTab === 'builder' && (
            <button
              onClick={handleSaveBuilder}
              disabled={!selectedPrimaryId && !selectedStarterId}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                selectedPrimaryId || selectedStarterId
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-stone-300 cursor-not-allowed'
              }`}
            >
              Guardar este Menú
            </button>
          )}

          {activeTab === 'free' && (
            <button
              onClick={handleSaveFreeMeal}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Guardar Comodín
            </button>
          )}

          {activeTab === 'matches' && (
            <button
              onClick={() => {
                onClose();
                onOpenRoulette(dayId, slotType);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Dices className="w-4 h-4" />
              <span>Girar Ruleta</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
