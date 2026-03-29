import { ChevronRight, Leaf } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile, backendInterface } from "../backend";

interface Props {
  onComplete: (profile: UserProfile) => void;
  actor: backendInterface | null;
}

const ALLERGY_OPTIONS = [
  "gluten-free",
  "dairy-free",
  "nut-free",
  "vegan",
  "vegetarian",
  "keto",
];

const GOALS = [
  {
    value: "lose_weight",
    label: "Lose Weight",
    desc: "Reduce body fat & calories",
    icon: "🔥",
  },
  {
    value: "maintain",
    label: "Maintain",
    desc: "Stay at current weight",
    icon: "⚖️",
  },
  {
    value: "gain_muscle",
    label: "Gain Muscle",
    desc: "Build strength & mass",
    icon: "💪",
  },
];

function calcCalories(
  weight: number,
  height: number,
  age: number,
  goal: string,
) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const multiplier =
    goal === "lose_weight" ? 1.2 : goal === "maintain" ? 1.55 : 1.725;
  return Math.round(bmr * multiplier);
}

export default function Onboarding({ onComplete, actor }: Props) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("maintain");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const goNext = (nextStep: number) => {
    setDir("forward");
    setStep(nextStep);
  };

  const goBack = (prevStep: number) => {
    setDir("back");
    setStep(prevStep);
  };

  const toggleRestriction = (r: string) =>
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const handleSubmit = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const w = Number.parseFloat(weight);
      const h = Number.parseFloat(height);
      const a = Number.parseInt(age);
      const cals = calcCalories(w, h, a, goal);
      const protein = Math.round(w * 2);
      const carbs = Math.round((cals * 0.4) / 4);
      const fat = Math.round((cals * 0.3) / 9);

      const profile: UserProfile = {
        name,
        age: BigInt(a),
        height_cm: h,
        weight_kg: w,
        goal,
        daily_calories: BigInt(cals),
        macro_targets: { protein_g: protein, carbs_g: carbs, fat_g: fat },
        dietary_restrictions: restrictions,
        last_active: BigInt(Date.now()) * BigInt(1_000_000),
      };
      await actor.saveCallerUserProfile(profile);
      toast.success("Welcome to VitalFlow!");
      onComplete(profile);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepAnimClass =
    dir === "forward" ? "animate-slide-step" : "animate-slide-step-back";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.15 0.05 155)" }}
    >
      {/* Background blobs */}
      <div
        className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none animate-float-orb"
        style={{
          background: "oklch(0.58 0.18 162 / 0.08)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none animate-float-orb-alt"
        style={{
          background: "oklch(0.35 0.12 160 / 0.12)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center gap-3 justify-center mb-8 animate-fade-up">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
              boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.35)",
            }}
          >
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span
            className="text-white text-2xl font-bold"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            }}
          >
            VitalFlow
          </span>
        </div>

        <div
          className="rounded-2xl p-8 animate-scale-in"
          style={{
            background: "oklch(0.995 0.002 90)",
            border: "1px solid oklch(0.90 0.008 90)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.24), 0 4px 12px rgba(0,0,0,0.10)",
          }}
        >
          {/* Progress indicator */}
          <div className="flex gap-2 mb-7">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="flex-1 relative h-1.5 rounded-full overflow-hidden"
                style={{ background: "oklch(0.90 0.008 90)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: s <= step ? "100%" : "0%",
                    background:
                      "linear-gradient(90deg, oklch(0.58 0.18 162), oklch(0.35 0.12 160))",
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "oklch(0.58 0.18 162)" }}
          >
            Step {step} of 3
          </div>

          {/* Steps */}
          {step === 1 && (
            <div key="step-1" className={stepAnimClass}>
              <h2
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                Let&apos;s get started
              </h2>
              <p className="mb-6" style={{ color: "oklch(0.50 0.02 180)" }}>
                Tell us about yourself
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ob-name"
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: "oklch(0.20 0.02 180)" }}
                  >
                    Your Name
                  </label>
                  <input
                    id="ob-name"
                    data-ocid="onboarding.name.input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    style={{
                      background: "oklch(0.97 0.005 90)",
                      border: "1.5px solid oklch(0.88 0.012 90)",
                      color: "oklch(0.13 0.02 180)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "oklch(0.58 0.18 162)";
                      e.target.style.boxShadow =
                        "0 0 0 3px oklch(0.58 0.18 162 / 0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "oklch(0.88 0.012 90)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: "ob-age",
                      label: "Age",
                      value: age,
                      setter: setAge,
                      placeholder: "28",
                      ocid: "onboarding.age.input",
                    },
                    {
                      id: "ob-height",
                      label: "Height (cm)",
                      value: height,
                      setter: setHeight,
                      placeholder: "175",
                      ocid: "onboarding.height.input",
                    },
                    {
                      id: "ob-weight",
                      label: "Weight (kg)",
                      value: weight,
                      setter: setWeight,
                      placeholder: "72",
                      ocid: "onboarding.weight.input",
                    },
                  ].map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="block text-sm font-semibold mb-1.5"
                        style={{ color: "oklch(0.20 0.02 180)" }}
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        data-ocid={field.ocid}
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                        style={{
                          background: "oklch(0.97 0.005 90)",
                          border: "1.5px solid oklch(0.88 0.012 90)",
                          color: "oklch(0.13 0.02 180)",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "oklch(0.58 0.18 162)";
                          e.target.style.boxShadow =
                            "0 0 0 3px oklch(0.58 0.18 162 / 0.12)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "oklch(0.88 0.012 90)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                data-ocid="onboarding.step1.primary_button"
                onClick={() => {
                  if (name && age && height && weight) goNext(2);
                  else toast.error("Please fill all fields");
                }}
                className="btn-shimmer mt-6 w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                  boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
                }}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div key="step-2" className={stepAnimClass}>
              <h2
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                What&apos;s your goal?
              </h2>
              <p className="mb-6" style={{ color: "oklch(0.50 0.02 180)" }}>
                We&apos;ll personalize your plan
              </p>
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    type="button"
                    key={g.value}
                    data-ocid={`onboarding.goal.${g.value}.toggle`}
                    onClick={() => setGoal(g.value)}
                    className="w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left"
                    style={{
                      border:
                        goal === g.value
                          ? "2px solid oklch(0.58 0.18 162)"
                          : "2px solid oklch(0.88 0.012 90)",
                      background:
                        goal === g.value
                          ? "oklch(0.58 0.18 162 / 0.08)"
                          : "oklch(0.995 0.002 90)",
                    }}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <div
                        className="font-bold text-sm"
                        style={{ color: "oklch(0.13 0.02 180)" }}
                      >
                        {g.label}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.50 0.02 180)" }}
                      >
                        {g.desc}
                      </div>
                    </div>
                    {goal === g.value && (
                      <div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "oklch(0.58 0.18 162)" }}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 10 10"
                          fill="white"
                          className="w-3 h-3"
                        >
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  data-ocid="onboarding.step2.cancel_button"
                  onClick={() => goBack(1)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    border: "1.5px solid oklch(0.88 0.012 90)",
                    color: "oklch(0.40 0.02 180)",
                    background: "transparent",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  data-ocid="onboarding.step2.primary_button"
                  onClick={() => goNext(3)}
                  className="btn-shimmer flex-[2] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                    boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
                  }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div key="step-3" className={stepAnimClass}>
              <h2
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                Dietary preferences
              </h2>
              <p className="mb-6" style={{ color: "oklch(0.50 0.02 180)" }}>
                Select any that apply (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ALLERGY_OPTIONS.map((r) => (
                  <button
                    type="button"
                    key={r}
                    data-ocid={`onboarding.diet.${r}.toggle`}
                    onClick={() => toggleRestriction(r)}
                    className="p-3 rounded-xl text-sm font-medium capitalize transition-all"
                    style={{
                      border: restrictions.includes(r)
                        ? "2px solid oklch(0.58 0.18 162)"
                        : "2px solid oklch(0.88 0.012 90)",
                      background: restrictions.includes(r)
                        ? "oklch(0.58 0.18 162 / 0.08)"
                        : "oklch(0.97 0.005 90)",
                      color: restrictions.includes(r)
                        ? "oklch(0.35 0.12 160)"
                        : "oklch(0.30 0.02 180)",
                    }}
                  >
                    {restrictions.includes(r) ? "✓ " : ""}
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  data-ocid="onboarding.step3.cancel_button"
                  onClick={() => goBack(2)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    border: "1.5px solid oklch(0.88 0.012 90)",
                    color: "oklch(0.40 0.02 180)",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  data-ocid="onboarding.step3.submit_button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-shimmer flex-[2] py-3.5 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                    boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.25)",
                  }}
                >
                  {loading ? "Setting up..." : "Let's Go! 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
