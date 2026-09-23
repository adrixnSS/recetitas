import { Dish, WeekPlan, DayCombo, SlotSelection } from '../types/meal';
import { DEFAULT_DISHES } from '../data/defaultCatalog';
import { DEFAULT_WEEKLY_BLUEPRINT } from '../data/weeklyBlueprint';

const STORAGE_KEYS = {
  DISHES: 'menu_familiar_dishes_v1',
  BLUEPRINT: 'menu_familiar_blueprint_v1',
  CURRENT_WEEK_PLAN: 'menu_familiar_current_week_plan_v1',
  SAVED_PLANS: 'menu_familiar_saved_plans_v1',
  CUSTOM_GROCERY_ITEMS: 'menu_familiar_custom_groceries_v1',
  CHECKED_GROCERIES: 'menu_familiar_checked_groceries_v1',
};

// Generate Monday of current week
export function getMondayOfCurrentWeek(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function formatWeekLabel(mondayIsoString: string): string {
  const monday = new Date(mondayIsoString + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${monday.getDate()} ${months[monday.getMonth()]} - ${sunday.getDate()} ${months[sunday.getMonth()]}`;
}

export function getInitialWeekPlan(mondayIso = getMondayOfCurrentWeek()): WeekPlan {
  // Let's create an intuitive initial week with a few pre-selected sample meals to guide the user:
  // e.g.
  // Lunes comida: Lentejas estofadas con patata (Match perfecto)
  // Lunes cena: Albóndigas con arroz blanco + Ensalada verde
  // Martes comida: Pasta Boloñesa
  // Martes cena: Pescado al horno con patatas y verduras
  return {
    id: `week_${mondayIso}`,
    startDate: mondayIso,
    weekLabel: formatWeekLabel(mondayIso),
    slots: {
      'day_1_comida': {
        primaryDishId: 'legumbre_lentejas_patata',
        completed: true,
      },
      'day_1_cena': {
        primaryDishId: 'carne_albondigas_arroz',
        sideDishId: 'veg_ensalada_verde',
        completed: true,
      },
      'day_2_comida': {
        primaryDishId: 'carne_pasta_bolonesa',
        completed: false,
      },
      'day_2_cena': {
        primaryDishId: 'pescado_al_horno_patatas',
        completed: false,
      },
    },
  };
}

export function loadDishes(): Dish[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISHES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading dishes:', err);
  }
  saveDishes(DEFAULT_DISHES);
  return DEFAULT_DISHES;
}

export function saveDishes(dishes: Dish[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes));
  } catch (err) {
    console.error('Error saving dishes:', err);
  }
}

export function loadBlueprint(): DayCombo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BLUEPRINT);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading blueprint:', err);
  }
  return DEFAULT_WEEKLY_BLUEPRINT;
}

export function saveBlueprint(blueprint: DayCombo[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BLUEPRINT, JSON.stringify(blueprint));
  } catch (err) {
    console.error('Error saving blueprint:', err);
  }
}

export function loadCurrentWeekPlan(): WeekPlan {
  const currentMonday = getMondayOfCurrentWeek();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK_PLAN);
    if (data) {
      const plan: WeekPlan = JSON.parse(data);
      if (plan && plan.startDate === currentMonday) {
        return plan;
      }
    }
  } catch (err) {
    console.error('Error loading current week plan:', err);
  }
  const newPlan = getInitialWeekPlan(currentMonday);
  saveCurrentWeekPlan(newPlan);
  return newPlan;
}

export function saveCurrentWeekPlan(plan: WeekPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_PLAN, JSON.stringify(plan));
  } catch (err) {
    console.error('Error saving current week plan:', err);
  }
}

export function loadCheckedGroceries(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKED_GROCERIES);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Error loading checked groceries:', err);
  }
  return [];
}

export function saveCheckedGroceries(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKED_GROCERIES, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving checked groceries:', err);
  }
}

export function loadCustomGroceries(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_GROCERY_ITEMS);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Error loading custom groceries:', err);
  }
  return ['Pan de barra', 'Fruta variada (plátanos, manzanas)', 'Aceite de oliva virgen extra', 'Leche'];
}

export function saveCustomGroceries(items: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_GROCERY_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving custom groceries:', err);
  }
}

export function generateWhatsAppSummary(
  blueprint: DayCombo[],
  plan: WeekPlan,
  dishesMap: Record<string, Dish>
): string {
  let text = `🍽️ *MENÚ FAMILIAR DE LA SEMANA (${plan.weekLabel})*\n\n`;

  blueprint.forEach((day) => {
    const comidaSlot = plan.slots[`day_${day.dayId}_comida`];
    const cenaSlot = plan.slots[`day_${day.dayId}_cena`];

    const getSlotText = (slot?: SlotSelection) => {
      if (!slot) return '⏳ _Por decidir_';
      if (slot.isFreeMeal) return '✨ ' + (slot.customNote || 'Comida libre / Fuera');
      
      const parts: string[] = [];
      if (slot.starterDishId && dishesMap[slot.starterDishId]) {
        parts.push(`1º: ${dishesMap[slot.starterDishId].name}`);
      }
      if (slot.primaryDishId && dishesMap[slot.primaryDishId]) {
        parts.push(dishesMap[slot.primaryDishId].name);
      }
      if (slot.sideDishId && dishesMap[slot.sideDishId]) {
        parts.push(`+ Guarnición: ${dishesMap[slot.sideDishId].name}`);
      }
      if (slot.customNote) {
        parts.push(`(${slot.customNote})`);
      }
      return parts.join(' | ') || '⏳ _Por decidir_';
    };

    text += `*${day.dayName.toUpperCase()}*\n`;
    text += `☀️ Comida: ${getSlotText(comidaSlot)}\n`;
    text += `🌙 Cena: ${getSlotText(cenaSlot)}\n\n`;
  });

  text += `Generado con el Planificador Familiar ✨`;
  return text;
}
