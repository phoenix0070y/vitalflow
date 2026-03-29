import { ChevronRight, Clock, Droplets, Flame, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import type {
  DailyFoodSummary,
  FoodLogEntry,
  UserProfile,
  backendInterface,
} from "../backend";
import LogMealModal from "../components/LogMealModal";
import LogWeightModal from "../components/LogWeightModal";
import LogWorkoutModal from "../components/LogWorkoutModal";

interface Props {
  actor: backendInterface | null;
  profile: UserProfile;
}

const today = () => new Date().toISOString().split("T")[0];
const WATER_KEY = () => `vf_water_${today()}`;

const _MACRO_COLORS = {
  protein: "oklch(0.58 0.18 162)",
  carbs: "oklch(0.74 0.14 84)",
  fat: "oklch(0.68 0.18 38)",
};
const MACRO_COLORS_HEX = {
  protein: "#2a9d8f",
  carbs: "#e9c46a",
  fat: "#e76f51",
};

function useCountUp(target: number, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const timer = setTimeout(() => {
      let startTime: number | null = null;
      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);
  return value;
}

export default function Dashboard({ actor, profile }: Props) {
  const [foodSummary, setFoodSummary] = useState<DailyFoodSummary | null>(null);
  const [water, setWater] = useState(() =>
    Number.parseInt(localStorage.getItem(WATER_KEY()) || "0"),
  );
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastFilled, setLastFilled] = useState<number | null>(null);

  const calorieTarget = Number(profile.daily_calories) || 2000;
  const macroTargets = profile.macro_targets || {
    protein_g: 160,
    carbs_g: 200,
    fat_g: 65,
  };

  useEffect(() => {
    if (!actor) return;
    actor
      .getMealLogsByDate(today())
      .then(setFoodSummary)
      .catch(() =>
        setFoodSummary({
          entries: [],
          totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        }),
      );
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, [actor]);

  const totals = foodSummary?.totals || {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  };
  const calPct = Math.min(
    100,
    Math.round((totals.calories / calorieTarget) * 100),
  );

  const macroData = [
    {
      name: "Protein",
      value: totals.protein_g,
      color: MACRO_COLORS_HEX.protein,
    },
    { name: "Carbs", value: totals.carbs_g, color: MACRO_COLORS_HEX.carbs },
    { name: "Fat", value: totals.fat_g, color: MACRO_COLORS_HEX.fat },
  ];

  const animatedCalories = useCountUp(totals.calories, 1400, 300);
  const animatedProtein = useCountUp(totals.protein_g, 1200, 400);
  const animatedCarbs = useCountUp(totals.carbs_g, 1200, 500);
  const animatedFat = useCountUp(totals.fat_g, 1200, 550);

  const handleWater = (dropIdx: number) => {
    const next =
      dropIdx < water ? Math.max(0, water - 1) : Math.min(8, water + 1);
    setWater(next);
    setLastFilled(dropIdx);
    localStorage.setItem(WATER_KEY(), String(next));
    setTimeout(() => setLastFilled(null), 520);
  };

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const mealsByType: Record<string, FoodLogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const e of foodSummary?.entries || []) {
    const t = e.meal_type.toLowerCase();
    if (mealsByType[t]) mealsByType[t].push(e);
  }

  const sampleWorkouts = [
    { name: "Full Body Strength", duration: 45, kcal: 420, tag: "Muscle Gain" },
    { name: "Fat Burn Cardio", duration: 30, kcal: 320, tag: "Weight Loss" },
  ];

  const cardBase =
    "rounded-2xl border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover";

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
            Welcome back, {profile.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "oklch(0.50 0.02 180)" }}>
            Here&apos;s how you&apos;re doing today
          </p>
        </div>
        <span
          className="rounded-full px-4 py-2 text-sm font-medium"
          style={{
            background: "oklch(0.995 0.002 90)",
            border: "1px solid oklch(0.88 0.012 90)",
            color: "oklch(0.45 0.02 180)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          {dateLabel}
        </span>
      </div>

      {/* Top 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Calorie ring */}
        <div
          className={`${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "60ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            Daily Calories
          </div>
          <div className="flex items-center gap-4">
            <div
              className="relative flex-shrink-0 animate-donut-in"
              style={{ animationDelay: "300ms" }}
            >
              <ResponsiveContainer width={96} height={96}>
                <PieChart>
                  <Pie
                    data={
                      macroData.some((d) => d.value > 0)
                        ? macroData
                        : [{ name: "Empty", value: 1, color: "#e9ecef" }]
                    }
                    cx={44}
                    cy={44}
                    innerRadius={30}
                    outerRadius={44}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {(macroData.some((d) => d.value > 0)
                      ? macroData
                      : [{ name: "Empty", value: 1, color: "#e9ecef" }]
                    ).map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v}g`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-lg font-bold"
                  style={{
                    color: "oklch(0.13 0.02 180)",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  {calPct}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: "oklch(0.13 0.02 180)",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  {animatedCalories}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                >
                  kcal
                </span>
              </div>
              <p
                className="text-xs mb-3"
                style={{ color: "oklch(0.60 0.02 180)" }}
              >
                of {calorieTarget} target
              </p>
              {macroData.map((m) => (
                <div key={m.name} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: m.color }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.02 180)" }}
                  >
                    {m.name}
                  </span>
                  <span
                    className="text-xs font-semibold ml-auto"
                    style={{ color: "oklch(0.25 0.02 180)" }}
                  >
                    {m.value}g
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Macros */}
        <div
          className={`${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "120ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            Macronutrients
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Protein",
                current: totals.protein_g,
                anim: animatedProtein,
                target: macroTargets.protein_g,
                color: MACRO_COLORS_HEX.protein,
                bg: "oklch(0.58 0.18 162 / 0.12)",
              },
              {
                label: "Carbs",
                current: totals.carbs_g,
                anim: animatedCarbs,
                target: macroTargets.carbs_g,
                color: MACRO_COLORS_HEX.carbs,
                bg: "oklch(0.74 0.14 84 / 0.12)",
              },
              {
                label: "Fat",
                current: totals.fat_g,
                anim: animatedFat,
                target: macroTargets.fat_g,
                color: MACRO_COLORS_HEX.fat,
                bg: "oklch(0.68 0.18 38 / 0.12)",
              },
            ].map((m) => {
              const pct = Math.min(100, (m.current / m.target) * 100);
              return (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span
                      className="font-semibold"
                      style={{ color: "oklch(0.25 0.02 180)" }}
                    >
                      {m.label}
                    </span>
                    <span style={{ color: "oklch(0.55 0.02 180)" }}>
                      {m.anim}g{" "}
                      <span style={{ color: "oklch(0.68 0.02 180)" }}>
                        / {m.target}g
                      </span>
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.92 0.008 90)" }}
                  >
                    <div
                      className="h-full rounded-full macro-bar-fill"
                      style={{
                        width: mounted ? `${pct}%` : "0%",
                        background: m.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Water tracker */}
          <div
            className="mt-5 pt-4"
            style={{ borderTop: "1px solid oklch(0.90 0.008 90)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-semibold"
                style={{ color: "oklch(0.25 0.02 180)" }}
              >
                Water Intake
              </span>
              <span
                className="text-xs"
                style={{ color: "oklch(0.55 0.02 180)" }}
              >
                {water}/8 glasses
              </span>
            </div>
            <div className="flex gap-1.5">
              {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((dropIdx) => (
                <button
                  type="button"
                  key={`water-${dropIdx}`}
                  data-ocid="dashboard.water.toggle"
                  onClick={() => handleWater(dropIdx)}
                  className={`transition-transform hover:scale-110 ${
                    lastFilled === dropIdx ? "animate-bounce-drop" : ""
                  }`}
                >
                  <Droplets
                    className="w-5 h-5"
                    style={{
                      color:
                        dropIdx < water
                          ? "oklch(0.58 0.18 162)"
                          : "oklch(0.85 0.01 90)",
                    }}
                    fill={dropIdx < water ? "oklch(0.58 0.18 162)" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Workout */}
        <div
          className={`${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "180ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            Today&apos;s Workouts
          </div>
          <div className="space-y-3">
            {sampleWorkouts.map((w, i) => (
              <div
                key={w.name}
                data-ocid={`dashboard.workout.item.${i + 1}`}
                className="rounded-xl p-3 transition-all hover:scale-[1.01]"
                style={{
                  background: "oklch(0.97 0.005 90)",
                  border: "1px solid oklch(0.90 0.008 90)",
                }}
              >
                <div
                  className="font-semibold text-sm mb-2"
                  style={{ color: "oklch(0.18 0.02 180)" }}
                >
                  {w.name}
                </div>
                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: "oklch(0.55 0.02 180)" }}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {w.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {w.kcal} kcal
                  </span>
                  <span
                    className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: "oklch(0.58 0.18 162 / 0.12)",
                      color: "oklch(0.35 0.12 160)",
                    }}
                  >
                    {w.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-column row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Daily Meal Log */}
        <div
          className={`${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "240ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            Daily Meal Log
          </div>
          {(["breakfast", "lunch", "dinner", "snack"] as const).map(
            (type, i) => {
              const mealTypeColors: Record<
                string,
                { bg: string; dot: string }
              > = {
                breakfast: {
                  bg: "oklch(0.74 0.14 84 / 0.15)",
                  dot: "oklch(0.65 0.16 60)",
                },
                lunch: {
                  bg: "oklch(0.58 0.18 162 / 0.12)",
                  dot: "oklch(0.58 0.18 162)",
                },
                dinner: {
                  bg: "oklch(0.52 0.18 260 / 0.12)",
                  dot: "oklch(0.52 0.18 260)",
                },
                snack: {
                  bg: "oklch(0.62 0.20 22 / 0.10)",
                  dot: "oklch(0.62 0.20 22)",
                },
              };
              const clr = mealTypeColors[type];
              return (
                <div
                  key={type}
                  data-ocid={`dashboard.meal.${type}.row`}
                  className="flex items-center justify-between py-3"
                  style={{
                    borderBottom:
                      i < 3 ? "1px solid oklch(0.92 0.006 90)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: clr.dot }}
                    />
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: "oklch(0.55 0.02 180)" }}
                      >
                        {type}
                      </div>
                      {mealsByType[type].length > 0 ? (
                        <div
                          className="text-sm mt-0.5"
                          style={{ color: "oklch(0.20 0.02 180)" }}
                        >
                          {mealsByType[type].map((e) => e.food_name).join(", ")}
                          <span
                            className="ml-1"
                            style={{ color: "oklch(0.55 0.02 180)" }}
                          >
                            (
                            {mealsByType[type].reduce(
                              (s, e) => s + e.calories,
                              0,
                            )}{" "}
                            kcal)
                          </span>
                        </div>
                      ) : (
                        <div
                          className="text-sm mt-0.5"
                          style={{ color: "oklch(0.70 0.01 180)" }}
                        >
                          No meals logged
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "oklch(0.70 0.01 180)" }}
                  />
                </div>
              );
            },
          )}
        </div>

        {/* Quick-add */}
        <div
          className={`${cardBase} p-5 animate-fade-up`}
          style={{ animationDelay: "300ms" }}
        >
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "oklch(0.50 0.02 180)" }}
          >
            Quick Add
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Log Meal",
                onClick: () => setShowMealModal(true),
                icon: "🍽️",
                ocid: "dashboard.log_meal.button",
              },
              {
                label: "Log Workout",
                onClick: () => setShowWorkoutModal(true),
                icon: "💪",
                ocid: "dashboard.log_workout.button",
              },
              {
                label: "Log Weight",
                onClick: () => setShowWeightModal(true),
                icon: "⚖️",
                ocid: "dashboard.log_weight.button",
              },
              {
                label: "Add Water",
                onClick: () => handleWater(water < 8 ? water : water - 1),
                icon: "💧",
                ocid: "dashboard.add_water.button",
              },
            ].map((btn) => (
              <button
                type="button"
                key={btn.label}
                data-ocid={btn.ocid}
                onClick={btn.onClick}
                className="btn-shimmer flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: "oklch(0.97 0.005 90)",
                  border: "1px solid oklch(0.88 0.012 90)",
                  color: "oklch(0.20 0.02 180)",
                }}
              >
                <span className="text-lg">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Calorie ring summary */}
          <div
            className="mt-4 pt-4 flex items-center gap-3"
            style={{ borderTop: "1px solid oklch(0.90 0.008 90)" }}
          >
            <div className="flex-1">
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: "oklch(0.25 0.02 180)" }}
              >
                Remaining Calories
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: "oklch(0.35 0.12 160)",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  {Math.max(0, calorieTarget - totals.calories)}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.02 180)" }}
                >
                  kcal left
                </span>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(oklch(0.58 0.18 162) ${calPct}%, oklch(0.90 0.008 90) ${calPct}%)`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.995 0.002 90)" }}
              >
                <Plus
                  className="w-4 h-4"
                  style={{ color: "oklch(0.35 0.12 160)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMealModal && (
        <LogMealModal
          actor={actor}
          onClose={() => setShowMealModal(false)}
          onSuccess={() => {
            setShowMealModal(false);
            actor?.getMealLogsByDate(today()).then(setFoodSummary);
            toast.success("Meal logged!");
          }}
        />
      )}
      {showWorkoutModal && (
        <LogWorkoutModal
          actor={actor}
          onClose={() => setShowWorkoutModal(false)}
          onSuccess={() => {
            setShowWorkoutModal(false);
            toast.success("Workout logged!");
          }}
        />
      )}
      {showWeightModal && (
        <LogWeightModal
          actor={actor}
          onClose={() => setShowWeightModal(false)}
          onSuccess={() => {
            setShowWeightModal(false);
            toast.success("Weight logged!");
          }}
        />
      )}
    </div>
  );
}
