import React, { useState, useEffect } from 'react';
import { DayCombo, Dish, SlotSelection, MealRequirement } from '../types/meal';
import {
  PROTEIN_LABELS,
  CARB_LABELS,
  VEG_LABELS,
  getRecommendedDishesForRequirement,
} from '../utils/matching';
import { X, Dices, Sparkles, Check, RotateCw, Trophy, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: number;
  slotType: 'comida' | 'cena';
  blueprint: DayCombo[];
  dishes: Dish[];
  onSaveSlot: (slotKey: string, selection: SlotSelection) => void;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  dayId,
  slotType,
  blueprint,
  dishes,
  onSaveSlot,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState<Dish | null>(null);

  const day = blueprint.find((b) => b.dayId === dayId);
  const requirement: MealRequirement | undefined = day ? day[slotType] : undefined;

  // Find candidate dishes: preferably full matches or protein matches
  const candidates = React.useMemo(() => {
    if (!requirement) return [];
    const recs = getRecommendedDishesForRequirement(dishes, requirement);
    if (recs.fullMatches.length > 0) {
      return [...recs.fullMatches, ...recs.proteinMatches.slice(0, 3)];
    }
    return recs.allEligible.length > 0 ? recs.allEligible : dishes.slice(0, 6);
  }, [dishes, requirement]);

  useEffect(() => {
    if (isOpen && candidates.length > 0) {
      setSelectedWinner(null);
      setIsSpinning(false);
      setCurrentIndex(0);
    }
  }, [isOpen, candidates]);

  if (!isOpen || !day || !requirement) return null;

  const slotKey = `day_${dayId}_${slotType}`;
  const pLabel = PROTEIN_LABELS[requirement.protein];
  const cLabel = CARB_LABELS[requirement.carb];
  const vLabel = VEG_LABELS[requirement.veg];

  const startSpin = () => {
    if (isSpinning || candidates.length === 0) return;
    setIsSpinning(true);
    setSelectedWinner(null);

    let current = 0;
    const totalSpins = 24 + Math.floor(Math.random() * candidates.length);
    let speed = 60; // initial speed ms

    const spinStep = (count: number) => {
      current = (current + 1) % candidates.length;
      setCurrentIndex(current);

      if (count < totalSpins) {
        // Slow down gradually near the end
        if (count > totalSpins - 8) {
          speed += 40;
        } else if (count > totalSpins - 14) {
          speed += 20;
        }
        setTimeout(() => spinStep(count + 1), speed);
      } else {
        // Winner chosen!
        const winner = candidates[current];
        setSelectedWinner(winner);
        setIsSpinning(false);

        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    };

    spinStep(0);
  };

  const handleAcceptWinner = () => {
    if (!selectedWinner) return;
    onSaveSlot(slotKey, {
      primaryDishId: selectedWinner.id,
      sideDishId: undefined,
      starterDishId: undefined,
      customNote: 'Elegido por Ruleta 🎲',
      isFreeMeal: false,
      completed: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Dices className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                Ruleta Gastronómica Familiar
              </h3>
              <p className="text-xs text-amber-100">
                {day.dayName} - {slotType === 'comida' ? 'Comida' : 'Cena'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 text-center space-y-5">
          {/* Slot requirement pills */}
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-xl text-xs font-semibold text-stone-700">
            <span>{pLabel.icon} {pLabel.name.split('/')[0]}</span>
            <span>+</span>
            <span>{cLabel.icon} {cLabel.name.split('/')[0]}</span>
            <span>+</span>
            <span>{vLabel.icon} {vLabel.name.replace('Verdura de ', '')}</span>
          </div>

          {/* Roulette display wheel */}
          <div className="relative py-8 px-4 bg-linear-to-b from-amber-50/70 to-orange-50/50 rounded-3xl border-2 border-amber-300 shadow-inner overflow-hidden">
            {candidates.length > 0 ? (
              <div className="space-y-3">
                <div
                  className={`text-2xl sm:text-3xl font-black text-stone-900 transition-all transform ${
                    isSpinning ? 'scale-105 blur-[0.5px] text-amber-800' : 'scale-100'
                  }`}
                >
                  {candidates[currentIndex]?.name}
                </div>

                <div className="text-xs font-medium text-stone-500">
                  {candidates[currentIndex]?.categoryHint || 'Receta de casa'}
                </div>

                {selectedWinner && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md animate-bounce mt-2">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>¡Plato Ganador Seleccionado!</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-500">No hay candidatos suficientes para este combo.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {!selectedWinner ? (
              <button
                onClick={startSpin}
                disabled={isSpinning || candidates.length === 0}
                className={`w-full py-3.5 px-4 rounded-2xl text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSpinning
                    ? 'bg-stone-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 active:scale-[0.98] shadow-orange-600/30'
                }`}
              >
                <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? '¡Girando la ruleta...!' : '¡Girar y decidir por nosotros!'}</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptWinner}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Aceptado! Asignar este plato</span>
                </button>
                <button
                  onClick={startSpin}
                  className="py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Girar otra vez</span>
                </button>
              </div>
            )}

            <p className="text-[11px] text-stone-400">
              La ruleta sólo elige entre platos que cumplen las normas nutricionales de este turno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
