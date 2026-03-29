import { ChevronRight, Clock, Flame, Play, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";
import WorkoutAnimation from "../components/WorkoutAnimation";

interface Props {
  actor: backendInterface | null;
}

type MockWorkout = {
  id: number;
  name: string;
  goal: string;
  difficulty: string;
  duration_minutes: number;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    duration_seconds: number;
    muscle_group: string;
    animation_type: string;
  }[];
};

const MOCK_WORKOUTS: MockWorkout[] = [
  {
    id: 1,
    name: "Full Body Strength",
    goal: "muscle_gain",
    difficulty: "intermediate",
    duration_minutes: 45,
    description:
      "Complete full body workout targeting all major muscle groups for maximum strength gains.",
    exercises: [
      {
        name: "Barbell Squats",
        sets: 4,
        reps: 10,
        duration_seconds: 0,
        muscle_group: "Legs",
        animation_type: "squat",
      },
      {
        name: "Push-ups",
        sets: 3,
        reps: 15,
        duration_seconds: 0,
        muscle_group: "Chest",
        animation_type: "pushup",
      },
      {
        name: "Plank Hold",
        sets: 3,
        reps: 0,
        duration_seconds: 60,
        muscle_group: "Core",
        animation_type: "plank",
      },
    ],
  },
  {
    id: 2,
    name: "Fat Burn Cardio",
    goal: "weight_loss",
    difficulty: "beginner",
    duration_minutes: 30,
    description:
      "High-intensity cardio to maximize calorie burn and boost your metabolism.",
    exercises: [
      {
        name: "Jogging in Place",
        sets: 3,
        reps: 0,
        duration_seconds: 60,
        muscle_group: "Cardio",
        animation_type: "run",
      },
      {
        name: "Mountain Climbers",
        sets: 3,
        reps: 20,
        duration_seconds: 0,
        muscle_group: "Core & Cardio",
        animation_type: "run",
      },
      {
        name: "Crunches",
        sets: 3,
        reps: 20,
        duration_seconds: 0,
        muscle_group: "Abs",
        animation_type: "crunch",
      },
    ],
  },
  {
    id: 3,
    name: "Core Blast",
    goal: "endurance",
    difficulty: "intermediate",
    duration_minutes: 25,
    description:
      "Focus on core strength and stability with a mix of isometric and dynamic exercises.",
    exercises: [
      {
        name: "Plank",
        sets: 4,
        reps: 0,
        duration_seconds: 45,
        muscle_group: "Core",
        animation_type: "plank",
      },
      {
        name: "Bicycle Crunches",
        sets: 3,
        reps: 20,
        duration_seconds: 0,
        muscle_group: "Abs",
        animation_type: "crunch",
      },
      {
        name: "Russian Twist",
        sets: 3,
        reps: 16,
        duration_seconds: 0,
        muscle_group: "Obliques",
        animation_type: "crunch",
      },
    ],
  },
  {
    id: 4,
    name: "Morning Run",
    goal: "weight_loss",
    difficulty: "beginner",
    duration_minutes: 20,
    description:
      "Easy morning run to kickstart your day and boost energy levels.",
    exercises: [
      {
        name: "Warm-up Jog",
        sets: 1,
        reps: 0,
        duration_seconds: 300,
        muscle_group: "Cardio",
        animation_type: "run",
      },
      {
        name: "Interval Sprints",
        sets: 5,
        reps: 0,
        duration_seconds: 30,
        muscle_group: "Cardio",
        animation_type: "run",
      },
    ],
  },
  {
    id: 5,
    name: "Leg Day",
    goal: "muscle_gain",
    difficulty: "advanced",
    duration_minutes: 60,
    description:
      "Intense leg day targeting quads, hamstrings, and glutes for maximum growth.",
    exercises: [
      {
        name: "Back Squats",
        sets: 5,
        reps: 8,
        duration_seconds: 0,
        muscle_group: "Quads",
        animation_type: "squat",
      },
      {
        name: "Romanian Deadlift",
        sets: 4,
        reps: 10,
        duration_seconds: 0,
        muscle_group: "Hamstrings",
        animation_type: "squat",
      },
      {
        name: "Wall Sit",
        sets: 3,
        reps: 0,
        duration_seconds: 60,
        muscle_group: "Quads",
        animation_type: "plank",
      },
    ],
  },
  {
    id: 6,
    name: "Flexibility & Recovery",
    goal: "flexibility",
    difficulty: "beginner",
    duration_minutes: 30,
    description:
      "Gentle stretching and mobility work to improve flexibility and aid recovery.",
    exercises: [
      {
        name: "Cat-Cow Stretch",
        sets: 3,
        reps: 10,
        duration_seconds: 0,
        muscle_group: "Spine",
        animation_type: "default",
      },
      {
        name: "Hip Flexor Stretch",
        sets: 2,
        reps: 0,
        duration_seconds: 30,
        muscle_group: "Hips",
        animation_type: "default",
      },
    ],
  },
];

const GOAL_FILTERS = [
  "All",
  "muscle_gain",
  "weight_loss",
  "endurance",
  "flexibility",
];
const GOAL_LABELS: Record<string, string> = {
  muscle_gain: "Muscle Gain",
  weight_loss: "Weight Loss",
  endurance: "Endurance",
  flexibility: "Flexibility",
  All: "All",
};

const DIFF_STYLE: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "oklch(0.58 0.18 162 / 0.12)", text: "oklch(0.35 0.14 162)" },
  intermediate: {
    bg: "oklch(0.74 0.14 84 / 0.15)",
    text: "oklch(0.50 0.16 70)",
  },
  advanced: { bg: "oklch(0.62 0.20 22 / 0.12)", text: "oklch(0.42 0.18 22)" },
};

const GOAL_ACCENT: Record<string, string> = {
  muscle_gain: "oklch(0.45 0.20 265)",
  weight_loss: "oklch(0.62 0.20 22)",
  endurance: "oklch(0.58 0.18 162)",
  flexibility: "oklch(0.74 0.14 84)",
};

const today = () => new Date().toISOString().split("T")[0];

export default function Workouts({ actor }: Props) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<MockWorkout | null>(null);
  const [logModal, setLogModal] = useState(false);
  const [duration, setDuration] = useState("45");
  const [calories, setCalories] = useState("350");
  const [logging, setLogging] = useState(false);

  const filtered =
    filter === "All"
      ? MOCK_WORKOUTS
      : MOCK_WORKOUTS.filter((w) => w.goal === filter);

  const handleLogWorkout = async () => {
    if (!actor || !selected) return;
    setLogging(true);
    try {
      await actor.logWorkout({
        workout_plan_id: BigInt(selected.id),
        date: today(),
        duration_minutes: BigInt(Number.parseInt(duration)),
        calories_burned: Number.parseFloat(calories),
        completed: true,
      });
      toast.success(`${selected.name} logged!`);
      setLogModal(false);
      setSelected(null);
    } catch {
      toast.error("Failed to log workout");
    } finally {
      setLogging(false);
    }
  };

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-7 animate-fade-up">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            color: "oklch(0.13 0.02 180)",
          }}
        >
          Workout Plans
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.02 180)" }}>
          Goal-based plans with animated exercise demos
        </p>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 mb-7 flex-wrap animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        {GOAL_FILTERS.map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`workouts.filter.${f}.tab`}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-shimmer"
            style={{
              background:
                filter === f
                  ? "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)"
                  : "oklch(0.995 0.002 90)",
              color: filter === f ? "white" : "oklch(0.45 0.02 180)",
              border:
                filter === f
                  ? "1px solid transparent"
                  : "1px solid oklch(0.88 0.012 90)",
              boxShadow:
                filter === f ? "0 4px 12px oklch(0.58 0.18 162 / 0.2)" : "none",
            }}
          >
            {GOAL_LABELS[f] || f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((w, idx) => {
          const diff = DIFF_STYLE[w.difficulty] || DIFF_STYLE.beginner;
          const accent = GOAL_ACCENT[w.goal] || "oklch(0.58 0.18 162)";
          return (
            <div
              key={w.id}
              data-ocid={`workouts.item.${idx + 1}`}
              className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 animate-fade-up"
              style={{
                background: "oklch(0.995 0.002 90)",
                border: "1px solid oklch(0.90 0.008 90)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                animationDelay: `${idx * 60}ms`,
              }}
            >
              {/* Top accent bar */}
              <div className="h-1" style={{ background: accent }} />

              {/* Animation preview area */}
              <div
                className="h-32 flex items-center justify-center relative overflow-hidden"
                style={{ background: "oklch(0.97 0.005 90)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${accent.replace(")", " / 0.08)")}, transparent 70%)`,
                  }}
                />
                <WorkoutAnimation
                  animationType={w.exercises[0]?.animation_type || "default"}
                  size={88}
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-bold text-base"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      color: "oklch(0.13 0.02 180)",
                    }}
                  >
                    {w.name}
                  </h3>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium capitalize ml-2 flex-shrink-0"
                    style={{ background: diff.bg, color: diff.text }}
                  >
                    {w.difficulty}
                  </span>
                </div>
                <p
                  className="text-xs mb-4 line-clamp-2"
                  style={{ color: "oklch(0.55 0.02 180)" }}
                >
                  {w.description}
                </p>
                <div
                  className="flex items-center gap-3 text-xs mb-4"
                  style={{ color: "oklch(0.55 0.02 180)" }}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {w.duration_minutes} min
                  </span>
                  <span>{w.exercises.length} exercises</span>
                  <span
                    className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${accent} / 0.1)`.replace(
                        ") / 0.1)",
                        " / 0.1)",
                      ),
                      color: accent,
                    }}
                  >
                    {GOAL_LABELS[w.goal]}
                  </span>
                </div>
                <button
                  type="button"
                  data-ocid={`workouts.view.${idx + 1}.button`}
                  onClick={() => setSelected(w)}
                  className="btn-shimmer w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                    boxShadow: "0 3px 10px oklch(0.58 0.18 162 / 0.2)",
                  }}
                >
                  <Play className="w-4 h-4" /> View Workout
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workout Detail Modal */}
      {selected && !logModal && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div
            data-ocid="workouts.detail.modal"
            className="rounded-2xl w-full max-w-2xl my-8 overflow-hidden animate-scale-in"
            style={{
              background: "oklch(0.995 0.002 90)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.30)",
            }}
          >
            {/* Modal header */}
            <div
              className="p-6 flex items-center justify-between"
              style={{ borderBottom: "1px solid oklch(0.90 0.008 90)" }}
            >
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    color: "oklch(0.13 0.02 180)",
                  }}
                >
                  {selected.name}
                </h2>
                <div className="flex gap-2 mt-1.5">
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium capitalize"
                    style={{
                      background: (
                        DIFF_STYLE[selected.difficulty] || DIFF_STYLE.beginner
                      ).bg,
                      color: (
                        DIFF_STYLE[selected.difficulty] || DIFF_STYLE.beginner
                      ).text,
                    }}
                  >
                    {selected.difficulty}
                  </span>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: "oklch(0.58 0.18 162 / 0.10)",
                      color: "oklch(0.35 0.12 160)",
                    }}
                  >
                    {GOAL_LABELS[selected.goal]}
                  </span>
                </div>
              </div>
              <button
                type="button"
                data-ocid="workouts.detail.close_button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 transition-colors hover:bg-gray-100"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                />
              </button>
            </div>

            <div className="p-6">
              <div
                className="flex gap-5 text-sm mb-5"
                style={{ color: "oklch(0.55 0.02 180)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {selected.duration_minutes} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />~
                  {Math.round(selected.duration_minutes * 8)} kcal
                </span>
                <span className="flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4" />
                  {selected.exercises.length} exercises
                </span>
              </div>

              <p
                className="text-sm mb-6"
                style={{ color: "oklch(0.50 0.02 180)" }}
              >
                {selected.description}
              </p>

              <h3
                className="font-bold mb-4"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "oklch(0.18 0.02 180)",
                }}
              >
                Exercises
              </h3>

              <div className="space-y-3">
                {selected.exercises.map((ex, i) => (
                  <div
                    key={`ex-${ex.name}-${i}`}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{
                      background: "oklch(0.97 0.005 90)",
                      border: "1px solid oklch(0.90 0.008 90)",
                    }}
                  >
                    <div
                      className="flex-shrink-0 rounded-xl flex items-center justify-center"
                      style={{
                        width: 80,
                        height: 80,
                        background: "oklch(0.995 0.002 90)",
                        border: "1px solid oklch(0.88 0.012 90)",
                      }}
                    >
                      <WorkoutAnimation
                        animationType={ex.animation_type}
                        size={72}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-bold mb-1"
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          color: "oklch(0.18 0.02 180)",
                        }}
                      >
                        {ex.name}
                      </div>
                      <div
                        className="text-sm mb-1.5"
                        style={{ color: "oklch(0.55 0.02 180)" }}
                      >
                        {ex.reps > 0
                          ? `${ex.sets} sets × ${ex.reps} reps`
                          : `${ex.sets} sets × ${ex.duration_seconds}s`}
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.58 0.18 162 / 0.10)",
                          color: "oklch(0.35 0.12 160)",
                        }}
                      >
                        {ex.muscle_group}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                data-ocid="workouts.log.open_modal_button"
                onClick={() => setLogModal(true)}
                className="btn-shimmer mt-6 w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                  boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
                }}
              >
                <Flame className="w-4 h-4" /> Log This Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log workout modal */}
      {logModal && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div
            data-ocid="workouts.log.modal"
            className="rounded-2xl p-6 w-full max-w-md animate-scale-in"
            style={{
              background: "oklch(0.995 0.002 90)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
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
                Log Workout
              </h3>
              <button
                type="button"
                data-ocid="workouts.log.close_button"
                onClick={() => setLogModal(false)}
                className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
              >
                <X
                  className="w-5 h-5"
                  style={{ color: "oklch(0.50 0.02 180)" }}
                />
              </button>
            </div>
            <p
              className="text-sm mb-4"
              style={{ color: "oklch(0.50 0.02 180)" }}
            >
              {selected.name}
            </p>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="dur-input"
                  className="text-sm font-semibold block mb-1.5"
                  style={{ color: "oklch(0.25 0.02 180)" }}
                >
                  Duration (minutes)
                </label>
                <input
                  id="dur-input"
                  data-ocid="workouts.log.duration.input"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  htmlFor="cal-input"
                  className="text-sm font-semibold block mb-1.5"
                  style={{ color: "oklch(0.25 0.02 180)" }}
                >
                  Calories Burned
                </label>
                <input
                  id="cal-input"
                  data-ocid="workouts.log.calories.input"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              type="button"
              data-ocid="workouts.log.confirm_button"
              onClick={handleLogWorkout}
              disabled={logging}
              className="btn-shimmer mt-4 w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
              }}
            >
              {logging ? "Saving..." : "Save Workout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
