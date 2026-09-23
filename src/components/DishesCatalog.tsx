import React, { useState } from 'react';
import { Dish, ProteinType, CarbType, VegType, DishRole } from '../types/meal';
import {
  PROTEIN_LABELS,
  CARB_LABELS,
  VEG_LABELS,
} from '../utils/matching';
import {
  Search,
  Plus,
  Clock,
  Star,
  Trash2,
  Edit3,
  BookOpen,
  Filter,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_DISHES } from '../data/defaultCatalog';

interface DishesCatalogProps {
  dishes: Dish[];
  onSaveDishes: (dishes: Dish[]) => void;
}

export const DishesCatalog: React.FC<DishesCatalogProps> = ({ dishes, onSaveDishes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtein, setSelectedProtein] = useState<string>('all');
  const [selectedCarb, setSelectedCarb] = useState<string>('all');
  const [selectedVeg, setSelectedVeg] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Modal for adding / editing a dish
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDishRole, setFormDishRole] = useState<DishRole>('plato_unico');
  const [formProteins, setFormProteins] = useState<ProteinType[]>([]);
  const [formCarbs, setFormCarbs] = useState<CarbType[]>([]);
  const [formVeggies, setFormVeggies] = useState<VegType[]>([]);
  const [formPrepTime, setFormPrepTime] = useState<number>(30);
  const [formIngredients, setFormIngredients] = useState<string>('');

  const openAddModal = () => {
    setEditingDish(null);
    setFormName('');
    setFormCategory('Plato familiar');
    setFormDescription('');
    setFormDishRole('plato_unico');
    setFormProteins([]);
    setFormCarbs([]);
    setFormVeggies([]);
    setFormPrepTime(30);
    setFormIngredients('');
    setIsModalOpen(true);
  };

  const openEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setFormName(dish.name);
    setFormCategory(dish.categoryHint || '');
    setFormDescription(dish.description || '');
    setFormDishRole(dish.dishRole);
    setFormProteins([...dish.proteins]);
    setFormCarbs([...dish.carbs]);
    setFormVeggies([...dish.veggies]);
    setFormPrepTime(dish.prepTimeMinutes || 30);
    setFormIngredients(dish.ingredients ? dish.ingredients.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const ingredientsList = formIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingDish) {
      // Update existing
      const updated = dishes.map((d) =>
        d.id === editingDish.id
          ? {
              ...d,
              name: formName.trim(),
              categoryHint: formCategory.trim() || undefined,
              description: formDescription.trim() || undefined,
              dishRole: formDishRole,
              proteins: formProteins,
              carbs: formCarbs,
              veggies: formVeggies,
              prepTimeMinutes: Number(formPrepTime) || 30,
              ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
            }
          : d
      );
      onSaveDishes(updated);
    } else {
      // Create new
      const newDish: Dish = {
        id: `custom_${Date.now()}`,
        name: formName.trim(),
        categoryHint: formCategory.trim() || 'Plato familiar',
        description: formDescription.trim() || undefined,
        dishRole: formDishRole,
        proteins: formProteins,
        carbs: formCarbs,
        veggies: formVeggies,
        prepTimeMinutes: Number(formPrepTime) || 30,
        ingredients: ingredientsList.length > 0 ? ingredientsList : undefined,
        isCustom: true,
      };
      onSaveDishes([newDish, ...dishes]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteDish = (id: string) => {
    if (confirm('¿Eliminar este plato del recetario?')) {
      onSaveDishes(dishes.filter((d) => d.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    onSaveDishes(
      dishes.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
    );
  };

  const handleResetToDefault = () => {
    if (confirm('¿Restablecer el recetario a la lista original de comidas y cenas familiares?')) {
      onSaveDishes(DEFAULT_DISHES);
    }
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProtein =
      selectedProtein === 'all' || d.proteins.includes(selectedProtein as ProteinType);
    const matchesCarb =
      selectedCarb === 'all' || d.carbs.includes(selectedCarb as CarbType);
    const matchesVeg =
      selectedVeg === 'all' || d.veggies.includes(selectedVeg as VegType);
    const matchesRole = selectedRole === 'all' || d.dishRole === selectedRole;

    return matchesSearch && matchesProtein && matchesCarb && matchesVeg && matchesRole;
  });

  const toggleArrayItem = <T,>(arr: T[], item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span>Recetario Familiar de Casa</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Todos los platos que la familia está dispuesta a comer, con sus nutrientes clasificados.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Nuevo Plato</span>
          </button>

          <button
            onClick={handleResetToDefault}
            title="Restablecer platos originales"
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de plato o ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </span>

          {/* Proteína */}
          <select
            value={selectedProtein}
            onChange={(e) => setSelectedProtein(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
          >
            <option value="all">Proteína: Todas</option>
            <option value="carne">🍗 Carne</option>
            <option value="pescado">🐟 Pescado</option>
            <option value="huevo">🥚 Huevo</option>
            <option value="legumbre">🫘 Legumbre</option>
          </select>

          {/* Carbohidrato */}
          <select
            value={selectedCarb}
            onChange={(e) => setSelectedCarb(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
          >
            <option value="all">Carbohidrato: Todos</option>
            <option value="arroz_pasta">🍚 Arroz y Pasta</option>
            <option value="tuberculo">🥔 Patata y Boniato</option>
          </select>

          {/* Verdura */}
          <select
            value={selectedVeg}
            onChange={(e) => setSelectedVeg(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
          >
            <option value="all">Verdura: Todas</option>
            <option value="hoja">🥬 De Hoja Verde</option>
            <option value="cocida">🥕 Cocinadas</option>
          </select>

          {/* Tipo de plato */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
          >
            <option value="all">Tipo: Todos</option>
            <option value="plato_unico">Plato Único (Completo)</option>
            <option value="plato_principal">Plato Principal</option>
            <option value="guarnicion_complemento">Guarnición / Acompañamiento</option>
            <option value="primer_plato">Primer Plato</option>
          </select>

          {(selectedProtein !== 'all' ||
            selectedCarb !== 'all' ||
            selectedVeg !== 'all' ||
            selectedRole !== 'all' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedProtein('all');
                setSelectedCarb('all');
                setSelectedVeg('all');
                setSelectedRole('all');
                setSearchTerm('');
              }}
              className="text-stone-500 hover:text-stone-800 underline font-semibold ml-1 cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Dishes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header with tags and favorite */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {dish.categoryHint || 'Receta de casa'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(dish.id)}
                    className={`p-1 rounded-md transition-colors ${
                      dish.favorite ? 'text-amber-500 fill-amber-500' : 'text-stone-300 hover:text-amber-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${dish.favorite ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => openEditModal(dish)}
                    className="p-1 text-stone-400 hover:text-amber-600 transition-colors"
                    title="Editar plato"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {dish.isCustom && (
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Eliminar plato"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-extrabold text-stone-900 text-base mb-1 group-hover:text-amber-900">
                {dish.name}
              </h3>
              {dish.description && (
                <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                  {dish.description}
                </p>
              )}

              {/* Nutrients badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {dish.proteins.map((p) => {
                  const lbl = PROTEIN_LABELS[p];
                  return (
                    <span
                      key={p}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lbl.badgeClass}`}
                    >
                      {lbl.icon} {lbl.name.split('/')[0]}
                    </span>
                  );
                })}

                {dish.carbs.map((c) => {
                  const lbl = CARB_LABELS[c];
                  return (
                    <span
                      key={c}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lbl.badgeClass}`}
                    >
                      {lbl.icon} {lbl.name.split('/')[0]}
                    </span>
                  );
                })}

                {dish.veggies.map((v) => {
                  const lbl = VEG_LABELS[v];
                  return (
                    <span
                      key={v}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lbl.badgeClass}`}
                    >
                      {lbl.icon} {lbl.name.replace('Verdura de ', '')}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Footer with time and role */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{dish.prepTimeMinutes || 25} min</span>
              </span>

              <span className="capitalize text-stone-600 font-semibold text-[11px]">
                {dish.dishRole === 'plato_unico'
                  ? 'Plato Único'
                  : dish.dishRole === 'plato_principal'
                  ? 'Plato Principal'
                  : dish.dishRole === 'guarnicion_complemento'
                  ? 'Guarnición'
                  : 'Primer Plato'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden my-auto">
            <div className="p-4 sm:p-5 bg-amber-500 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-lg">
                {editingDish ? 'Editar Plato Familiar' : 'Añadir Nuevo Plato Familiar'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Nombre del plato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pollo asado con patatas y ensalada"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Categoría o Tipo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carne magra o aves, Pescados, Guiso..."
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Función del plato
                </label>
                <select
                  value={formDishRole}
                  onChange={(e) => setFormDishRole(e.target.value as DishRole)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="plato_unico">Plato Único (cubre varios nutrientes)</option>
                  <option value="plato_principal">Plato Principal / Segundo</option>
                  <option value="guarnicion_complemento">Guarnición / Acompañamiento</option>
                  <option value="primer_plato">Primer Plato (Sopa / Crema)</option>
                </select>
              </div>

              {/* Nutrients Checklist */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="text-xs font-bold text-stone-700 uppercase">
                  Aporte Nutricional del Plato:
                </div>

                {/* Proteins */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">Proteínas:</span>
                  <div className="flex flex-wrap gap-2">
                    {(['carne', 'pescado', 'huevo', 'legumbre'] as ProteinType[]).map((p) => {
                      const isSelected = formProteins.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleArrayItem(formProteins, p, setFormProteins)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {PROTEIN_LABELS[p].icon} {PROTEIN_LABELS[p].name.split('/')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">Carbohidratos:</span>
                  <div className="flex flex-wrap gap-2">
                    {(['arroz_pasta', 'tuberculo'] as CarbType[]).map((c) => {
                      const isSelected = formCarbs.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleArrayItem(formCarbs, c, setFormCarbs)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {CARB_LABELS[c].icon} {CARB_LABELS[c].name.split('/')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Veggies */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">Verduras y Hortalizas:</span>
                  <div className="flex flex-wrap gap-2">
                    {(['hoja', 'cocida'] as VegType[]).map((v) => {
                      const isSelected = formVeggies.includes(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleArrayItem(formVeggies, v, setFormVeggies)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {VEG_LABELS[v].icon} {VEG_LABELS[v].name.replace('Verdura de ', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time & Ingredients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Tiempo de preparación (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Ingredientes (separados por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pollo, Patatas, Ajo, Limón"
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Descripción o trucos familiares
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de preparación o cómo le gusta a la familia..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                >
                  Guardar Plato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
