import { X } from "lucide-react";
import { useState } from "react";
import type { backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  onClose: () => void;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export default function LogMealModal({ actor, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    food_name: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    meal_type: "breakfast",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!actor || !form.food_name) return;
    setLoading(true);
    try {
      await actor.logMeal({
        food_name: form.food_name,
        calories: Number.parseFloat(form.calories) || 0,
        protein_g: Number.parseFloat(form.protein_g) || 0,
        carbs_g: Number.parseFloat(form.carbs_g) || 0,
        fat_g: Number.parseFloat(form.fat_g) || 0,
        meal_type: form.meal_type,
        date: today(),
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#111214]">Log Meal</h3>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={form.food_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, food_name: e.target.value }))
            }
            placeholder="Food name"
            className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.calories}
              onChange={(e) =>
                setForm((p) => ({ ...p, calories: e.target.value }))
              }
              placeholder="Calories"
              className="border border-[#E6E8EB] rounded-xl px-4 py-3"
            />
            <input
              type="number"
              value={form.protein_g}
              onChange={(e) =>
                setForm((p) => ({ ...p, protein_g: e.target.value }))
              }
              placeholder="Protein (g)"
              className="border border-[#E6E8EB] rounded-xl px-4 py-3"
            />
            <input
              type="number"
              value={form.carbs_g}
              onChange={(e) =>
                setForm((p) => ({ ...p, carbs_g: e.target.value }))
              }
              placeholder="Carbs (g)"
              className="border border-[#E6E8EB] rounded-xl px-4 py-3"
            />
            <input
              type="number"
              value={form.fat_g}
              onChange={(e) =>
                setForm((p) => ({ ...p, fat_g: e.target.value }))
              }
              placeholder="Fat (g)"
              className="border border-[#E6E8EB] rounded-xl px-4 py-3"
            />
          </div>
          <select
            value={form.meal_type}
            onChange={(e) =>
              setForm((p) => ({ ...p, meal_type: e.target.value }))
            }
            className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !form.food_name}
          className="mt-4 w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ background: "#2F8F7A" }}
        >
          {loading ? "Logging..." : "Log Meal"}
        </button>
      </div>
    </div>
  );
}
