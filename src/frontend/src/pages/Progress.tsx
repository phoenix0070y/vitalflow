import { Plus, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { UserProfile, WeightEntry, backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  profile: UserProfile;
}

const today = () => new Date().toISOString().split("T")[0];

function getBMICategory(bmi: number) {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      color: "oklch(0.58 0.18 230)",
      hex: "#4895ef",
    };
  if (bmi < 25)
    return { label: "Normal", color: "oklch(0.58 0.18 162)", hex: "#2a9d8f" };
  if (bmi < 30)
    return {
      label: "Overweight",
      color: "oklch(0.74 0.14 84)",
      hex: "#e9c46a",
    };
  return { label: "Obese", color: "oklch(0.62 0.20 22)", hex: "#e76f51" };
}

export default function Progress({ actor, profile }: Props) {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [bmi, setBmi] = useState<number | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newWeight, setNewWeight] = useState(String(profile.weight_kg));
  const [newDate, setNewDate] = useState(today());
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (!actor) return;
    actor
      .getWeightHistory()
      .then((h) => {
        if (h.length === 0) {
          const w = profile.weight_kg;
          const mockHistory: WeightEntry[] = [
            { weight_kg: w + 2.5, date: "2026-01-01" },
            { weight_kg: w + 2.0, date: "2026-01-15" },
            { weight_kg: w + 1.5, date: "2026-02-01" },
            { weight_kg: w + 1.0, date: "2026-02-15" },
            { weight_kg: w + 0.5, date: "2026-03-01" },
            { weight_kg: w, date: today() },
          ];
          setWeightHistory(mockHistory);
        } else {
          setWeightHistory(h);
        }
      })
      .catch(() => {});
    actor
      .calculateBMI()
      .then(setBmi)
      .catch(() => {
        const h = profile.height_cm / 100;
        setBmi(Math.round((profile.weight_kg / (h * h)) * 10) / 10);
      });
  }, [actor, profile]);

  const handleLogWeight = async () => {
    if (!actor) return;
    setLogging(true);
    try {
      await actor.logWeight({
        weight_kg: Number.parseFloat(newWeight),
        date: newDate,
      });
      toast.success("Weight logged!");
      actor.getWeightHistory().then(setWeightHistory);
      setShowLogModal(false);
    } catch {
      toast.error("Failed to log weight");
    } finally {
      setLogging(false);
    }
  };

  const sortedHistory = [...weightHistory].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const chartData = sortedHistory.map((e) => ({
    date: e.date.slice(5),
    weight: e.weight_kg,
  }));

  const firstWeight = sortedHistory[0]?.weight_kg || profile.weight_kg;
  const lastWeight =
    sortedHistory[sortedHistory.length - 1]?.weight_kg || profile.weight_kg;
  const change = Math.round((lastWeight - firstWeight) * 10) / 10;

  const bmiInfo = bmi ? getBMICategory(bmi) : null;

  const cardBase = "rounded-2xl border bg-card shadow-card";
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

  const statCards = [
    {
      label: "Current Weight",
      value: `${lastWeight} kg`,
      sub: "latest entry",
      icon: "⚖️",
    },
    {
      label: "Weight Change",
      value: `${change >= 0 ? "+" : ""}${change} kg`,
      sub: change < 0 ? "on track" : "since start",
      icon: change < 0 ? "trending_down" : "trending_up",
    },
    {
      label: "Goal",
      value: profile.goal.replace("_", " "),
      sub: "current target",
      icon: "🎯",
    },
    {
      label: "Weight Entries",
      value: `${sortedHistory.length}`,
      sub: "logged sessions",
      icon: "📊",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
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
            Progress Tracking
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.02 180)" }}>
            Your fitness journey at a glance
          </p>
        </div>
        <button
          type="button"
          data-ocid="progress.log_weight.button"
          onClick={() => setShowLogModal(true)}
          className="btn-shimmer flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
          }}
        >
          <Plus className="w-4 h-4" /> Log Weight
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            data-ocid={`progress.stat.item.${i + 1}`}
            className={`${cardBase} p-4 animate-fade-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "oklch(0.55 0.02 180)" }}
            >
              {s.label}
            </div>
            <div className="flex items-end gap-2">
              <div
                className="font-bold text-xl capitalize"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                {s.value}
              </div>
              {s.icon === "trending_down" && (
                <TrendingDown
                  className="w-4 h-4 mb-0.5"
                  style={{ color: "oklch(0.58 0.18 162)" }}
                />
              )}
              {s.icon === "trending_up" && (
                <TrendingUp
                  className="w-4 h-4 mb-0.5"
                  style={{ color: "oklch(0.62 0.20 22)" }}
                />
              )}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.60 0.02 180)" }}
            >
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Weight chart — gradient fill */}
        <div
          className={`md:col-span-2 ${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "240ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            Weight History
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2a9d8f" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2a9d8f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.90 0.008 90)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "oklch(0.55 0.02 180)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "oklch(0.55 0.02 180)" }}
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => [`${v} kg`, "Weight"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid oklch(0.88 0.012 90)",
                  background: "oklch(0.995 0.002 90)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotoneX"
                dataKey="weight"
                stroke="#2a9d8f"
                strokeWidth={2.5}
                fill="url(#weightGrad)"
                dot={{ fill: "#2a9d8f", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* BMI card */}
        <div
          className={`${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "300ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            BMI Calculator
          </div>
          {bmi && bmiInfo ? (
            <>
              <div className="text-center mb-5">
                <div
                  className="text-5xl font-bold mb-2"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    color: bmiInfo.hex,
                  }}
                >
                  {bmi.toFixed(1)}
                </div>
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    background: `${bmiInfo.hex}20`,
                    color: bmiInfo.hex,
                  }}
                >
                  {bmiInfo.label}
                </span>
              </div>

              {/* Visual scale bar */}
              <div className="mb-4">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(90deg, #4895ef 0%, #2a9d8f 30%, #e9c46a 65%, #e76f51 100%)",
                  }}
                />
                <div
                  className="flex justify-between text-[10px] mt-1"
                  style={{ color: "oklch(0.60 0.02 180)" }}
                >
                  <span>16</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { range: "< 18.5", label: "Underweight", hex: "#4895ef" },
                  { range: "18.5 – 24.9", label: "Normal", hex: "#2a9d8f" },
                  { range: "25 – 29.9", label: "Overweight", hex: "#e9c46a" },
                  { range: "≥ 30", label: "Obese", hex: "#e76f51" },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="flex justify-between text-xs p-2 rounded-lg"
                    style={{
                      background:
                        c.label === bmiInfo.label
                          ? `${c.hex}14`
                          : "transparent",
                      fontWeight: c.label === bmiInfo.label ? 700 : 400,
                    }}
                  >
                    <span style={{ color: c.hex }}>{c.label}</span>
                    <span style={{ color: "oklch(0.55 0.02 180)" }}>
                      {c.range}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              className="text-center text-sm py-8"
              style={{ color: "oklch(0.55 0.02 180)" }}
            >
              Loading BMI...
            </div>
          )}
        </div>
      </div>

      {/* Weight log table */}
      <div
        className={`${cardBase} p-5 animate-fade-up`}
        style={{ animationDelay: "360ms" }}
      >
        <div
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "oklch(0.50 0.02 180)" }}
        >
          Weight Log
        </div>
        {sortedHistory.length === 0 ? (
          <p
            data-ocid="progress.log.empty_state"
            className="text-sm text-center py-6"
            style={{ color: "oklch(0.55 0.02 180)" }}
          >
            No weight entries yet. Log your first weight!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="progress.log.table">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.90 0.008 90)" }}>
                  {["Date", "Weight (kg)", "Change"].map((h) => (
                    <th
                      key={h}
                      className={`py-2.5 font-semibold text-xs uppercase tracking-wider ${
                        h === "Date" ? "text-left" : "text-right"
                      }`}
                      style={{ color: "oklch(0.50 0.02 180)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...sortedHistory].reverse().map((e, i, arr) => {
                  const prev = arr[i + 1];
                  const diff = prev
                    ? Math.round((e.weight_kg - prev.weight_kg) * 10) / 10
                    : null;
                  return (
                    <tr
                      key={e.date}
                      data-ocid={`progress.log.item.${i + 1}`}
                      style={{ borderBottom: "1px solid oklch(0.93 0.006 90)" }}
                    >
                      <td
                        className="py-3"
                        style={{ color: "oklch(0.25 0.02 180)" }}
                      >
                        {e.date}
                      </td>
                      <td
                        className="py-3 text-right font-semibold"
                        style={{ color: "oklch(0.18 0.02 180)" }}
                      >
                        {e.weight_kg}
                      </td>
                      <td className="py-3 text-right">
                        {diff !== null ? (
                          <span
                            className="font-medium"
                            style={{
                              color:
                                diff <= 0
                                  ? "oklch(0.58 0.18 162)"
                                  : "oklch(0.62 0.20 22)",
                            }}
                          >
                            {diff >= 0 ? "+" : ""}
                            {diff}
                          </span>
                        ) : (
                          <span style={{ color: "oklch(0.65 0.02 180)" }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div
            data-ocid="progress.log.modal"
            className="rounded-2xl p-6 w-full max-w-sm animate-scale-in"
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
                Log Weight
              </h3>
              <button
                type="button"
                data-ocid="progress.log.close_button"
                onClick={() => setShowLogModal(false)}
                className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="prog-weight"
                  className="text-sm font-semibold block mb-1.5"
                  style={{ color: "oklch(0.25 0.02 180)" }}
                >
                  Weight (kg)
                </label>
                <input
                  id="prog-weight"
                  data-ocid="progress.weight.input"
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  htmlFor="prog-date"
                  className="text-sm font-semibold block mb-1.5"
                  style={{ color: "oklch(0.25 0.02 180)" }}
                >
                  Date
                </label>
                <input
                  id="prog-date"
                  data-ocid="progress.date.input"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              type="button"
              data-ocid="progress.log.confirm_button"
              onClick={handleLogWeight}
              disabled={logging}
              className="btn-shimmer mt-4 w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
              }}
            >
              {logging ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
