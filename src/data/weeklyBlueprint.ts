import { DayCombo, MealRequirement } from '../types/meal';

export const DEFAULT_WEEKLY_BLUEPRINT: DayCombo[] = [
  {
    dayId: 1,
    dayName: 'Lunes',
    comida: {
      protein: 'legumbre',
      carb: 'tuberculo',
      veg: 'cocida',
    },
    cena: {
      protein: 'carne',
      carb: 'arroz_pasta',
      veg: 'hoja',
    },
  },
  {
    dayId: 2,
    dayName: 'Martes',
    comida: {
      protein: 'carne',
      carb: 'arroz_pasta',
      veg: 'cocida',
    },
    cena: {
      protein: 'pescado',
      carb: 'tuberculo',
      veg: 'cocida',
    },
  },
  {
    dayId: 3,
    dayName: 'Miércoles',
    comida: {
      protein: 'pescado',
      carb: 'tuberculo',
      veg: 'cocida',
    },
    cena: {
      protein: 'huevo',
      carb: 'arroz_pasta',
      veg: 'hoja',
    },
  },
  {
    dayId: 4,
    dayName: 'Jueves',
    comida: {
      protein: 'legumbre',
      carb: 'arroz_pasta',
      veg: 'cocida',
    },
    cena: {
      protein: 'carne',
      carb: 'tuberculo',
      veg: 'cocida',
    },
  },
  {
    dayId: 5,
    dayName: 'Viernes',
    comida: {
      protein: 'carne',
      carb: 'arroz_pasta',
      veg: 'cocida',
    },
    cena: {
      protein: 'huevo',
      carb: 'arroz_pasta',
      veg: 'hoja',
    },
  },
  {
    dayId: 6,
    dayName: 'Sábado',
    comida: {
      protein: 'pescado',
      carb: 'arroz_pasta',
      veg: 'hoja',
    },
    cena: {
      protein: 'legumbre',
      carb: 'tuberculo',
      veg: 'cocida',
    },
  },
  {
    dayId: 7,
    dayName: 'Domingo',
    comida: {
      protein: 'carne',
      carb: 'tuberculo',
      veg: 'cocida',
    },
    cena: {
      protein: 'pescado',
      carb: 'arroz_pasta',
      veg: 'cocida',
    },
  },
];

export const TARGET_NUTRITION_FREQUENCIES = {
  protein: {
    carne: { label: 'Carne magra o aves', min: 3, max: 4, unit: 'x semana', icon: '🍗', color: 'rose' },
    pescado: { label: 'Pescado blanco y azul', min: 3, max: 4, unit: 'x semana', icon: '🐟', color: 'sky' },
    huevo: { label: 'Huevos', min: 4, max: 7, unit: 'x semana', icon: '🥚', color: 'amber' },
    legumbre: { label: 'Legumbres', min: 3, max: 4, unit: 'x semana', icon: '🫘', color: 'orange' },
  },
  carb: {
    arroz_pasta: { label: 'Arroz y pasta', min: 4, max: 5, unit: 'x semana', icon: '🍚', color: 'amber' },
    tuberculo: { label: 'Patata y boniato', min: 3, max: 4, unit: 'x semana', icon: '🥔', color: 'yellow' },
  },
  veg: {
    hoja: { label: 'Verdura de hoja verde', min: 3, max: 4, unit: 'x semana', icon: '🥬', color: 'emerald' },
    cocida: { label: 'Verduras cocinadas', min: 5, max: 6, unit: 'x semana', icon: '🥕', color: 'green' },
  },
};
