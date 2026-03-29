import { X } from "lucide-react";
import { useState } from "react";
import type { backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  onClose: () => void;
  onSuccess: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export default function LogWeightModal({ actor, onClose, onSuccess }: Props) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!actor || !weight) return;
    setLoading(true);
    try {
      await actor.logWeight({ weight_kg: Number.parseFloat(weight), date });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#111214]">Log Weight</h3>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="weight-input"
              className="text-sm font-medium text-[#111214] block mb-1"
            >
              Weight (kg)
            </label>
            <input
              id="weight-input"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 72.5"
              className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label
              htmlFor="lw-date"
              className="text-sm font-medium text-[#111214] block mb-1"
            >
              Date
            </label>
            <input
              id="lw-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[#E6E8EB] rounded-xl px-4 py-3"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !weight}
          className="mt-4 w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ background: "#2F8F7A" }}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
