import { Dish, MealRequirement, ProteinType, CarbType, VegType, SlotSelection } from '../types/meal';

export const PROTEIN_LABELS: Record<ProteinType, { name: string; icon: string; badgeClass: string; desc: string }> = {
  carne: {
    name: 'Carne magra / Aves',
    icon: '🍗',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    desc: 'Pollo, ternera, hamburguesas, sanjacobos...',
  },
  pescado: {
    name: 'Pescado blanco / azul',
    icon: '🐟',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    desc: 'Al horno, merluza, dorada, salmón, bacalao...',
  },
  huevo: {
    name: 'Huevos',
    icon: '🥚',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    desc: 'Rellenos, fritos con arroz, carbonara, ensalada...',
  },
  legumbre: {
    name: 'Legumbres',
    icon: '🫘',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    desc: 'Lentejas, garbanzos, alubias, potaje, cocido...',
  },
};

export const CARB_LABELS: Record<CarbType, { name: string; icon: string; badgeClass: string; desc: string }> = {
  arroz_pasta: {
    name: 'Arroz / Pasta',
    icon: '🍚',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    desc: 'Arroz caldoso, pasta boloñesa, arroz salteado, sopa...',
  },
  tuberculo: {
    name: 'Patata / Boniato',
    icon: '🥔',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'Puré de patatas, patatas panaderas, boniatos rellenos...',
  },
};

export const VEG_LABELS: Record<VegType, { name: string; icon: string; badgeClass: string; desc: string }> = {
  hoja: {
    name: 'Verdura de Hoja verde',
    icon: '🥬',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    desc: 'Ensalada verde, espinacas tiernas, canónigos, quiche...',
  },
  cocida: {
    name: 'Verduras cocinadas',
    icon: '🥕',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    desc: 'Cremas, verduras al horno, sofrito de guisos, berenjenas...',
  },
};

export interface MatchScore {
  hasProtein: boolean;
  hasCarb: boolean;
  hasVeg: boolean;
  score: number; // 0 to 3
  isPerfectMatch: boolean;
}

export function evaluateDishMatch(dish: Dish, req: MealRequirement): MatchScore {
  const hasProtein = dish.proteins.includes(req.protein);
  const hasCarb = dish.carbs.includes(req.carb);
  const hasVeg = dish.veggies.includes(req.veg);
  
  let score = 0;
  if (hasProtein) score++;
  if (hasCarb) score++;
  if (hasVeg) score++;

  return {
    hasProtein,
    hasCarb,
    hasVeg,
    score,
    isPerfectMatch: hasProtein && hasCarb && hasVeg,
  };
}

export function evaluateComboMatch(
  primaryDish?: Dish,
  sideDish?: Dish,
  starterDish?: Dish,
  req?: MealRequirement
): {
  hasProtein: boolean;
  hasCarb: boolean;
  hasVeg: boolean;
  isComplete: boolean;
  providedBy: {
    protein?: string;
    carb?: string;
    veg?: string;
  };
} {
  if (!req) {
    return {
      hasProtein: false,
      hasCarb: false,
      hasVeg: false,
      isComplete: false,
      providedBy: {},
    };
  }

  const allDishes = [primaryDish, sideDish, starterDish].filter(Boolean) as Dish[];

  const proteinDish = allDishes.find((d) => d.proteins.includes(req.protein));
  const carbDish = allDishes.find((d) => d.carbs.includes(req.carb));
  const vegDish = allDishes.find((d) => d.veggies.includes(req.veg));

  const hasProtein = Boolean(proteinDish);
  const hasCarb = Boolean(carbDish);
  const hasVeg = Boolean(vegDish);

  return {
    hasProtein,
    hasCarb,
    hasVeg,
    isComplete: hasProtein && hasCarb && hasVeg,
    providedBy: {
      protein: proteinDish?.name,
      carb: carbDish?.name,
      veg: vegDish?.name,
    },
  };
}

/**
 * Filter catalog for a specific requirement into:
 * 1. Platos Únicos que cumplen todo al 100%
 * 2. Platos Principales con la proteína pedida
 * 3. Acompañamientos que aportan el carbohidrato pedido
 * 4. Entrantes / Verduras que aportan la verdura pedida
 */
export function getRecommendedDishesForRequirement(allDishes: Dish[], req: MealRequirement) {
  // 1. All-in-one dishes that satisfy all 3 criteria
  const fullMatches = allDishes.filter((dish) => {
    const match = evaluateDishMatch(dish, req);
    return match.isPerfectMatch;
  });

  // 2. Main dishes matching the required protein (excluding the ones already in fullMatches)
  const proteinMatches = allDishes.filter((dish) => {
    return dish.proteins.includes(req.protein) && !fullMatches.some((f) => f.id === dish.id);
  });

  // 3. Side dishes / complements that provide the required carb
  const carbComplements = allDishes.filter((dish) => {
    return dish.carbs.includes(req.carb) && (dish.dishRole === 'guarnicion_complemento' || dish.dishRole === 'primer_plato');
  });

  // 4. Veggie dishes / starters that provide the required veggie
  const vegComplements = allDishes.filter((dish) => {
    return dish.veggies.includes(req.veg) && (dish.dishRole === 'guarnicion_complemento' || dish.dishRole === 'primer_plato');
  });

  // All valid candidates (any dish that covers at least one required element and fits the slot context)
  const allEligible = allDishes.filter((dish) => {
    const match = evaluateDishMatch(dish, req);
    return match.score > 0;
  });

  return {
    fullMatches,
    proteinMatches,
    carbComplements,
    vegComplements,
    allEligible,
  };
}
