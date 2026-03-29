import { X } from "lucide-react";
import { useState } from "react";
import type { backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  onClose: () => void;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export default function LogWorkoutModal({ actor, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    workout_name: "",
    duration: "30",
    calories: "250",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      await actor.logWorkout({
        workout_plan_id: BigInt(0),
        date: today(),
        duration_minutes: BigInt(Number.parseInt(form.duration)),
        calories_burned: Number.parseFloat(form.calories),
        completed: true,
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#111214]">Log Workout</h3>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={form.workout_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, workout_name: e.target.value }))
            }
            placeholder="Workout name (optional)"
            className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
          />
          <input
            type="number"
            value={form.duration}
            onChange={(e) =>
              setForm((p) => ({ ...p, duration: e.target.value }))
            }
            placeholder="Duration (minutes)"
            className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
          />
          <input
            type="number"
            value={form.calories}
            onChange={(e) =>
              setForm((p) => ({ ...p, calories: e.target.value }))
            }
            placeholder="Calories burned"
            className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl text-white font-semibold"
          style={{ background: "#2F8F7A" }}
        >
          {loading ? "Saving..." : "Log Workout"}
        </button>
      </div>
    </div>
  );
}
