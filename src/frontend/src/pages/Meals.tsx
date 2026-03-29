import { Filter, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MealTemplate, UserProfile, backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  profile: UserProfile;
}

const ALLERGY_TAGS = [
  "gluten-free",
  "dairy-free",
  "vegan",
  "vegetarian",
  "keto",
  "nut-free",
];

const MOCK_MEALS: (Omit<MealTemplate, "image"> & { emoji: string })[] = [
  {
    name: "Avocado Toast",
    description: "Creamy avocado on sourdough with poached egg",
    calories: 350,
    protein_g: 12,
    carbs_g: 38,
    fat_g: 18,
    allergy_tags: ["vegan", "gluten-free"],
    category: "breakfast",
    emoji: "🥑",
  },
  {
    name: "Grilled Chicken Salad",
    description: "Fresh greens with grilled chicken and olive oil",
    calories: 420,
    protein_g: 45,
    carbs_g: 18,
    fat_g: 14,
    allergy_tags: ["dairy-free", "gluten-free"],
    category: "lunch",
    emoji: "🥗",
  },
  {
    name: "Greek Yogurt Bowl",
    description: "Greek yogurt with berries and honey",
    calories: 280,
    protein_g: 20,
    carbs_g: 32,
    fat_g: 8,
    allergy_tags: ["vegetarian", "gluten-free"],
    category: "breakfast",
    emoji: "🍓",
  },
  {
    name: "Salmon & Quinoa",
    description: "Pan-seared salmon with quinoa and vegetables",
    calories: 520,
    protein_g: 42,
    carbs_g: 35,
    fat_g: 18,
    allergy_tags: ["gluten-free", "dairy-free"],
    category: "dinner",
    emoji: "🐟",
  },
  {
    name: "Overnight Oats",
    description: "Oats soaked overnight with chia seeds and fruit",
    calories: 340,
    protein_g: 12,
    carbs_g: 55,
    fat_g: 8,
    allergy_tags: ["vegan", "gluten-free"],
    category: "breakfast",
    emoji: "🥣",
  },
  {
    name: "Turkey Wrap",
    description: "Whole wheat wrap with turkey, avocado, veggies",
    calories: 480,
    protein_g: 35,
    carbs_g: 52,
    fat_g: 12,
    allergy_tags: ["dairy-free"],
    category: "lunch",
    emoji: "🌯",
  },
  {
    name: "Lentil Soup",
    description: "Hearty lentil soup with aromatic spices",
    calories: 290,
    protein_g: 18,
    carbs_g: 42,
    fat_g: 6,
    allergy_tags: ["vegan", "gluten-free", "dairy-free"],
    category: "dinner",
    emoji: "🍲",
  },
  {
    name: "Protein Smoothie",
    description: "Banana, protein powder, almond milk, peanut butter",
    calories: 380,
    protein_g: 32,
    carbs_g: 38,
    fat_g: 12,
    allergy_tags: ["vegan", "gluten-free"],
    category: "snack",
    emoji: "🥤",
  },
];

const CATEGORY_STRIPS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  breakfast: {
    bg: "linear-gradient(90deg, oklch(0.78 0.15 72), oklch(0.74 0.14 84))",
    text: "white",
    label: "Breakfast",
  },
  lunch: {
    bg: "linear-gradient(90deg, oklch(0.55 0.18 162), oklch(0.42 0.16 165))",
    text: "white",
    label: "Lunch",
  },
  dinner: {
    bg: "linear-gradient(90deg, oklch(0.45 0.20 265), oklch(0.38 0.18 270))",
    text: "white",
    label: "Dinner",
  },
  snack: {
    bg: "linear-gradient(90deg, oklch(0.65 0.22 18), oklch(0.58 0.20 25))",
    text: "white",
    label: "Snack",
  },
};

const today = () => new Date().toISOString().split("T")[0];

const inputStyle = {
  background: "oklch(0.97 0.005 90)",
  border: "1.5px solid oklch(0.88 0.012 90)",
  color: "oklch(0.13 0.02 180)",
  borderRadius: "0.75rem",
  padding: "12px 16px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};

export default function Meals({ actor, profile }: Props) {
  const meals = MOCK_MEALS;
  const [selectedTags, setSelectedTags] = useState<string[]>(
    profile.dietary_restrictions || [],
  );
  const [logModal, setLogModal] = useState<(typeof MOCK_MEALS)[0] | null>(null);
  const [mealType, setMealType] = useState("breakfast");
  const [customModal, setCustomModal] = useState(false);
  const [custom, setCustom] = useState({
    food_name: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    meal_type: "breakfast",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllMealTemplates()
      .then(() => {})
      .catch(() => {});
  }, [actor]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const filteredMeals =
    selectedTags.length === 0
      ? meals
      : meals.filter((m) =>
          selectedTags.every((t) => m.allergy_tags.includes(t)),
        );

  const handleLog = async () => {
    if (!actor || !logModal) return;
    setLoading(true);
    try {
      await actor.logMeal({
        food_name: logModal.name,
        calories: logModal.calories,
        protein_g: logModal.protein_g,
        carbs_g: logModal.carbs_g,
        fat_g: logModal.fat_g,
        meal_type: mealType,
        date: today(),
      });
      toast.success(`${logModal.name} logged to ${mealType}!`);
      setLogModal(null);
    } catch {
      toast.error("Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLog = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      await actor.logMeal({
        food_name: custom.food_name,
        calories: Number.parseFloat(custom.calories) || 0,
        protein_g: Number.parseFloat(custom.protein_g) || 0,
        carbs_g: Number.parseFloat(custom.carbs_g) || 0,
        fat_g: Number.parseFloat(custom.fat_g) || 0,
        meal_type: custom.meal_type,
        date: today(),
      });
      toast.success("Custom meal logged!");
      setCustomModal(false);
      setCustom({
        food_name: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fat_g: "",
        meal_type: "breakfast",
      });
    } catch {
      toast.error("Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    cursor: "pointer",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7 animate-fade-up">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              color: "oklch(0.13 0.02 180)",
            }}
          >
            Meal Library
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.02 180)" }}>
            Browse and log meals tailored to your needs
          </p>
        </div>
        <button
          type="button"
          data-ocid="meals.log_custom.button"
          onClick={() => setCustomModal(true)}
          className="btn-shimmer flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
          }}
        >
          <Plus className="w-4 h-4" /> Log Custom Meal
        </button>
      </div>

      {/* Allergy filters */}
      <div
        className="flex items-center gap-2 mb-6 flex-wrap animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        <Filter className="w-4 h-4" style={{ color: "oklch(0.55 0.02 180)" }} />
        <span
          className="text-sm font-medium mr-1"
          style={{ color: "oklch(0.55 0.02 180)" }}
        >
          Filter:
        </span>
        {ALLERGY_TAGS.map((tag) => (
          <button
            type="button"
            key={tag}
            data-ocid={`meals.filter.${tag}.toggle`}
            onClick={() => toggleTag(tag)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize"
            style={{
              background: selectedTags.includes(tag)
                ? "oklch(0.58 0.18 162 / 0.12)"
                : "oklch(0.995 0.002 90)",
              color: selectedTags.includes(tag)
                ? "oklch(0.35 0.12 160)"
                : "oklch(0.50 0.02 180)",
              border: selectedTags.includes(tag)
                ? "1.5px solid oklch(0.58 0.18 162 / 0.5)"
                : "1.5px solid oklch(0.88 0.012 90)",
            }}
          >
            {selectedTags.includes(tag) && "✓ "}
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            type="button"
            data-ocid="meals.clear_filter.button"
            onClick={() => setSelectedTags([])}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              color: "oklch(0.62 0.20 22)",
              border: "1.5px solid oklch(0.62 0.20 22 / 0.4)",
            }}
          >
            <X className="w-3 h-3 inline mr-1" />
            Clear
          </button>
        )}
      </div>

      <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.02 180)" }}>
        {filteredMeals.length} meals found
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeals.map((meal, idx) => {
          const strip = CATEGORY_STRIPS[meal.category] || CATEGORY_STRIPS.snack;
          return (
            <div
              key={meal.name}
              data-ocid={`meals.item.${idx + 1}`}
              className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 animate-fade-up"
              style={{
                background: "oklch(0.995 0.002 90)",
                border: "1px solid oklch(0.90 0.008 90)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                animationDelay: `${idx * 50}ms`,
              }}
            >
              {/* Category strip */}
              <div className="h-1.5 w-full" style={{ background: strip.bg }} />
              {/* Emoji hero */}
              <div
                className="h-28 flex items-center justify-center text-5xl"
                style={{ background: "oklch(0.97 0.005 90)" }}
              >
                {meal.emoji}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1.5">
                  <h3
                    className="font-bold text-sm"
                    style={{ color: "oklch(0.13 0.02 180)" }}
                  >
                    {meal.name}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize ml-2 flex-shrink-0"
                    style={{
                      background: `${strip.bg.split(",")[0].replace("linear-gradient(90deg, ", "")} / 0.15)`,
                      color: "oklch(0.35 0.12 160)",
                      border: "1px solid oklch(0.58 0.18 162 / 0.2)",
                    }}
                  >
                    {meal.category}
                  </span>
                </div>
                <p
                  className="text-xs mb-3 line-clamp-2"
                  style={{ color: "oklch(0.55 0.02 180)" }}
                >
                  {meal.description}
                </p>
                <div
                  className="flex items-center gap-2 text-xs mb-3"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "oklch(0.18 0.02 180)" }}
                  >
                    {meal.calories}
                  </span>
                  <span>kcal</span>
                  <span className="ml-auto">P {meal.protein_g}g</span>
                  <span>C {meal.carbs_g}g</span>
                  <span>F {meal.fat_g}g</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {meal.allergy_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs capitalize font-medium"
                      style={{
                        background: "oklch(0.58 0.18 162 / 0.10)",
                        color: "oklch(0.35 0.12 160)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  data-ocid={`meals.log.${idx + 1}.button`}
                  onClick={() => setLogModal(meal)}
                  className="btn-shimmer w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.42 0.16 162) 100%)",
                  }}
                >
                  Add to Log
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log meal modal */}
      {logModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div
            data-ocid="meals.log.modal"
            className="rounded-2xl p-6 w-full max-w-md animate-scale-in"
            style={{
              background: "oklch(0.995 0.002 90)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                Add to Meal Log
              </h3>
              <button
                type="button"
                data-ocid="meals.log.close_button"
                onClick={() => setLogModal(null)}
                className="rounded-lg p-1 transition-colors hover:bg-gray-100"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                />
              </button>
            </div>
            <div
              className="flex items-center gap-3 mb-4 p-3 rounded-xl"
              style={{ background: "oklch(0.97 0.005 90)" }}
            >
              <span className="text-3xl">{logModal.emoji}</span>
              <div>
                <div
                  className="font-bold"
                  style={{ color: "oklch(0.13 0.02 180)" }}
                >
                  {logModal.name}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                >
                  {logModal.calories} kcal · P {logModal.protein_g}g · C{" "}
                  {logModal.carbs_g}g · F {logModal.fat_g}g
                </div>
              </div>
            </div>
            <label
              htmlFor="meal-type-select"
              className="block text-sm font-semibold mb-2"
              style={{ color: "oklch(0.25 0.02 180)" }}
            >
              Meal Type
            </label>
            <select
              id="meal-type-select"
              data-ocid="meals.log.select"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              style={selectStyle}
              className="mb-4"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <button
              type="button"
              data-ocid="meals.log.confirm_button"
              onClick={handleLog}
              disabled={loading}
              className="btn-shimmer w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
              }}
            >
              {loading ? "Logging..." : "Log Meal"}
            </button>
          </div>
        </div>
      )}

      {/* Custom meal modal */}
      {customModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div
            data-ocid="meals.custom.modal"
            className="rounded-2xl p-6 w-full max-w-md animate-scale-in"
            style={{
              background: "oklch(0.995 0.002 90)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                Log Custom Meal
              </h3>
              <button
                type="button"
                data-ocid="meals.custom.close_button"
                onClick={() => setCustomModal(false)}
                className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                />
              </button>
            </div>
            <div className="space-y-3">
              <input
                data-ocid="meals.custom.name.input"
                value={custom.food_name}
                onChange={(e) =>
                  setCustom((p) => ({ ...p, food_name: e.target.value }))
                }
                placeholder="Food name"
                style={inputStyle}
              />
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: "calories",
                    placeholder: "Calories",
                    ocid: "meals.custom.calories.input",
                  },
                  {
                    key: "protein_g",
                    placeholder: "Protein (g)",
                    ocid: "meals.custom.protein.input",
                  },
                  {
                    key: "carbs_g",
                    placeholder: "Carbs (g)",
                    ocid: "meals.custom.carbs.input",
                  },
                  {
                    key: "fat_g",
                    placeholder: "Fat (g)",
                    ocid: "meals.custom.fat.input",
                  },
                ].map((f) => (
                  <input
                    key={f.key}
                    type="number"
                    data-ocid={f.ocid}
                    value={custom[f.key as keyof typeof custom]}
                    onChange={(e) =>
                      setCustom((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    style={inputStyle}
                  />
                ))}
              </div>
              <select
                data-ocid="meals.custom.type.select"
                value={custom.meal_type}
                onChange={(e) =>
                  setCustom((p) => ({ ...p, meal_type: e.target.value }))
                }
                style={selectStyle}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <button
              type="button"
              data-ocid="meals.custom.confirm_button"
              onClick={handleCustomLog}
              disabled={loading || !custom.food_name}
              className="btn-shimmer mt-4 w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
              }}
            >
              {loading ? "Logging..." : "Log Meal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
