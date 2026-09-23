export type ProteinType = 'carne' | 'pescado' | 'huevo' | 'legumbre';
export type CarbType = 'arroz_pasta' | 'tuberculo';
export type VegType = 'hoja' | 'cocida';

export type DishRole = 'plato_unico' | 'plato_principal' | 'primer_plato' | 'guarnicion_complemento';

export interface MealRequirement {
  protein: ProteinType;
  carb: CarbType;
  veg: VegType;
}

export interface DayCombo {
  dayId: number; // 1 to 7 (Lunes to Domingo)
  dayName: string;
  comida: MealRequirement;
  cena: MealRequirement;
}

export interface Dish {
  id: string;
  name: string;
  categoryHint?: string; // e.g. "Carne magra o aves", "Arroz y pasta", etc.
  description?: string;
  dishRole: DishRole;
  proteins: ProteinType[];
  carbs: CarbType[];
  veggies: VegType[];
  isCustom?: boolean;
  prepTimeMinutes?: number;
  ingredients?: string[];
  favorite?: boolean;
}

export interface SlotSelection {
  primaryDishId?: string;
  sideDishId?: string; // e.g. pure de patata, arroz blanco, ensalada
  starterDishId?: string; // e.g. crema de verduras, sopa
  customNote?: string;
  isFreeMeal?: boolean; // e.g. "Comida fuera / Pizza / Improvisada"
  completed?: boolean;
}

export interface WeekPlan {
  id: string;
  weekLabel: string;
  startDate: string; // ISO string for Monday of the week
  // slots indexed by "day_1_comida", "day_1_cena", ...
  slots: Record<string, SlotSelection>;
}
