import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  ChefHat,
  Dumbbell,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import type { UserProfile } from "../backend";
import type { backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
  profile: UserProfile;
}

interface MealSuggestion {
  name: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  description?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const cardBase = "rounded-2xl overflow-hidden transition-all duration-200";

// ─── Meal Suggestions Tab ────────────────────────────────────────────────
function MealSuggestionsTab({ actor, profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MealSuggestion[] | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);

  async function fetchSuggestions() {
    if (!actor) return;
    setLoading(true);
    setSuggestions(null);
    setRawText(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const summary = await actor.getMealLogsByDate(today);
      const { calories, protein_g, carbs_g, fat_g } = summary.totals;
      const result = await actor.getAIMealSuggestions(
        calories,
        protein_g,
        carbs_g,
        fat_g,
      );
      try {
        const jsonMatch = result.match(/\[.*\]/s);
        const parsed: MealSuggestion[] = JSON.parse(
          jsonMatch ? jsonMatch[0] : result,
        );
        setSuggestions(Array.isArray(parsed) ? parsed : null);
        if (!Array.isArray(parsed)) setRawText(result);
      } catch {
        setRawText(result);
      }
    } catch {
      setRawText("Failed to get suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-lg font-bold"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              color: "oklch(0.13 0.02 180)",
            }}
          >
            Personalized Meal Ideas
          </h2>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.02 180)" }}>
            AI suggestions based on today&apos;s intake &amp; your goal:{" "}
            <span
              className="font-semibold capitalize"
              style={{ color: "oklch(0.35 0.12 160)" }}
            >
              {profile.goal.replace("_", " ")}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={loading}
          data-ocid="ai.meal_suggestions.button"
          className="btn-shimmer flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            boxShadow: "0 4px 14px oklch(0.58 0.18 162 / 0.25)",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Thinking..." : "Get Meal Ideas"}
        </button>
      </div>

      {loading && (
        <div
          data-ocid="ai.meal_suggestions.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-5 space-y-3 animate-pulse"
              style={{
                background: "oklch(0.995 0.002 90)",
                border: "1px solid oklch(0.90 0.008 90)",
              }}
            >
              <div
                className="h-4 rounded-lg"
                style={{ background: "oklch(0.92 0.008 90)", width: "75%" }}
              />
              <div
                className="h-3 rounded-lg"
                style={{ background: "oklch(0.93 0.006 90)" }}
              />
              <div
                className="h-3 rounded-lg"
                style={{ background: "oklch(0.93 0.006 90)", width: "66%" }}
              />
            </div>
          ))}
        </div>
      )}

      {suggestions && (
        <div
          data-ocid="ai.meal_suggestions.list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {suggestions.map((meal, i) => (
            <div
              key={`${meal.name}-${i}`}
              data-ocid={`ai.meal_suggestions.item.${i + 1}`}
              className={`${cardBase} animate-fade-up hover:-translate-y-1 hover:shadow-card-hover`}
              style={{
                background: "oklch(0.995 0.002 90)",
                border: "1px solid oklch(0.90 0.008 90)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                animationDelay: `${i * 60}ms`,
              }}
            >
              {/* Teal top strip */}
              <div
                className="h-1"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.58 0.18 162), oklch(0.42 0.16 165))",
                }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    className="font-bold text-sm leading-snug"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      color: "oklch(0.13 0.02 180)",
                    }}
                  >
                    {meal.name}
                  </h3>
                  {meal.calories && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{
                        background: "oklch(0.58 0.18 162 / 0.12)",
                        color: "oklch(0.35 0.12 160)",
                      }}
                    >
                      {meal.calories} kcal
                    </span>
                  )}
                </div>
                {meal.description && (
                  <p
                    className="text-xs mb-3 leading-relaxed"
                    style={{ color: "oklch(0.50 0.02 180)" }}
                  >
                    {meal.description}
                  </p>
                )}
                {(meal.protein_g || meal.carbs_g || meal.fat_g) && (
                  <div
                    className="flex gap-3 pt-2"
                    style={{ borderTop: "1px solid oklch(0.92 0.006 90)" }}
                  >
                    {meal.protein_g && (
                      <div className="text-center">
                        <div
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.55 0.18 230)" }}
                        >
                          {meal.protein_g}g
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "oklch(0.60 0.02 180)" }}
                        >
                          Protein
                        </div>
                      </div>
                    )}
                    {meal.carbs_g && (
                      <div className="text-center">
                        <div
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.65 0.16 60)" }}
                        >
                          {meal.carbs_g}g
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "oklch(0.60 0.02 180)" }}
                        >
                          Carbs
                        </div>
                      </div>
                    )}
                    {meal.fat_g && (
                      <div className="text-center">
                        <div
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.62 0.20 22)" }}
                        >
                          {meal.fat_g}g
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "oklch(0.60 0.02 180)" }}
                        >
                          Fat
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rawText && !suggestions && (
        <div
          data-ocid="ai.meal_suggestions.success_state"
          className="rounded-2xl p-5"
          style={{
            background: "oklch(0.995 0.002 90)",
            border: "1px solid oklch(0.58 0.18 162 / 0.25)",
          }}
        >
          <pre
            className="whitespace-pre-wrap text-sm leading-relaxed"
            style={{
              color: "oklch(0.25 0.02 180)",
              fontFamily: "'Satoshi', sans-serif",
            }}
          >
            {rawText}
          </pre>
        </div>
      )}

      {!loading && !suggestions && !rawText && (
        <div
          data-ocid="ai.meal_suggestions.empty_state"
          className="rounded-2xl p-12 text-center"
          style={{
            background: "oklch(0.97 0.005 90)",
            border: "2px dashed oklch(0.85 0.012 90)",
          }}
        >
          <ChefHat
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.75 0.02 180)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.55 0.02 180)" }}>
            Click the button above to get personalized meal suggestions based on
            your nutrition today.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Workout Recommendation Tab ──────────────────────────────────────────
function WorkoutRecommendationTab({ actor, profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  async function fetchRecommendation() {
    if (!actor) return;
    setLoading(true);
    setRecommendation(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      });
      const workoutCounts = await Promise.all(
        weekDates.map((d) => actor.getWorkoutsByDate(d)),
      );
      const completedCount = workoutCounts.filter(
        (logs) => logs.length > 0 && logs.some((l) => l.completed),
      ).length;
      const summary = `Goal: ${profile.goal.replace("_", " ")}, Recent workouts this week: ${completedCount} sessions, Today: ${today}`;
      const result = await actor.getAIWorkoutRecommendation(summary);
      setRecommendation(result);
    } catch {
      setRecommendation("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-lg font-bold"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              color: "oklch(0.13 0.02 180)",
            }}
          >
            Adaptive Workout Plan
          </h2>
          <p className="text-sm mt-1" style={{ color: "oklch(0.50 0.02 180)" }}>
            Personalized recommendations based on your activity history and
            goal.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRecommendation}
          disabled={loading}
          data-ocid="ai.workout.button"
          className="btn-shimmer flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            boxShadow: "0 4px 14px oklch(0.58 0.18 162 / 0.25)",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Dumbbell className="w-4 h-4" />
          )}
          {loading ? "Analyzing..." : "Get Workout Plan"}
        </button>
      </div>

      {loading && (
        <div
          data-ocid="ai.workout.loading_state"
          className="rounded-2xl p-10 text-center animate-pulse"
          style={{
            background: "oklch(0.97 0.005 90)",
            border: "1px solid oklch(0.90 0.008 90)",
          }}
        >
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-3"
            style={{ color: "oklch(0.58 0.18 162)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.55 0.02 180)" }}>
            Analyzing your workout history...
          </p>
        </div>
      )}

      {recommendation && !loading && (
        <div
          data-ocid="ai.workout.success_state"
          className="rounded-2xl overflow-hidden animate-fade-up"
          style={{
            background: "oklch(0.995 0.002 90)",
            border: "1px solid oklch(0.90 0.008 90)",
          }}
        >
          <div
            className="h-1"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.58 0.18 162), oklch(0.35 0.12 160))",
            }}
          />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.58 0.18 162 / 0.12)" }}
              >
                <Bot
                  className="w-4 h-4"
                  style={{ color: "oklch(0.35 0.12 160)" }}
                />
              </div>
              <h3
                className="font-bold"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                Your Personalized Plan
              </h3>
            </div>
            <pre
              className="whitespace-pre-wrap text-sm leading-relaxed rounded-xl p-4"
              style={{
                color: "oklch(0.25 0.02 180)",
                fontFamily: "'Satoshi', sans-serif",
                background: "oklch(0.97 0.005 90)",
              }}
            >
              {recommendation}
            </pre>
          </div>
        </div>
      )}

      {!loading && !recommendation && (
        <div
          data-ocid="ai.workout.empty_state"
          className="rounded-2xl p-12 text-center"
          style={{
            background: "oklch(0.97 0.005 90)",
            border: "2px dashed oklch(0.85 0.012 90)",
          }}
        >
          <Dumbbell
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.75 0.02 180)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.55 0.02 180)" }}>
            Get an AI-generated workout plan tailored to your goal and recent
            activity.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Nutrition Chat Tab ───────────────────────────────────────────────────
function NutritionChatTab({ actor, profile }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: `Hi ${profile.name}! I\'m your AI nutrition coach. Ask me anything about diet, macros, healthy eating, or how to reach your ${profile.goal.replace("_", " ")} goal. 🥗`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || !actor || loading) return;
    const userMsg: ChatMessage = {
      id: `u-${++counterRef.current}`,
      role: "user",
      content: msg,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const context = messages
        .slice(-3)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");
      const reply = await actor.chatWithNutritionAI(msg, context);
      setMessages((prev) => [
        ...prev,
        { id: `a-${counterRef.current}`, role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${counterRef.current}`,
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 580 }}>
      {/* Messages */}
      <div
        data-ocid="ai.chat.panel"
        className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 px-1"
      >
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            data-ocid={`ai.chat.item.${i + 1}`}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{
                background:
                  msg.role === "assistant"
                    ? "linear-gradient(135deg, oklch(0.58 0.18 162), oklch(0.35 0.12 160))"
                    : "oklch(0.40 0.04 180)",
              }}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            {/* Bubble */}
            <div
              className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, oklch(0.58 0.18 162), oklch(0.42 0.16 165))"
                    : "oklch(0.995 0.002 90)",
                color: msg.role === "user" ? "white" : "oklch(0.20 0.02 180)",
                border:
                  msg.role === "assistant"
                    ? "1px solid oklch(0.90 0.008 90)"
                    : "none",
                borderRadius:
                  msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                boxShadow:
                  msg.role === "assistant"
                    ? "0 2px 8px rgba(0,0,0,0.05)"
                    : "0 2px 10px oklch(0.58 0.18 162 / 0.2)",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div
            data-ocid="ai.chat.loading_state"
            className="flex gap-3 flex-row"
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162), oklch(0.35 0.12 160))",
              }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div
              className="rounded-2xl px-5 py-3.5"
              style={{
                background: "oklch(0.995 0.002 90)",
                border: "1px solid oklch(0.90 0.008 90)",
                borderRadius: "18px 18px 18px 4px",
              }}
            >
              <div className="flex gap-1.5 items-center h-5">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: "oklch(0.58 0.18 162)",
                      animationDelay: `${delay}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex gap-2 items-end pt-4"
        style={{ borderTop: "1px solid oklch(0.90 0.008 90)" }}
      >
        <Textarea
          data-ocid="ai.chat.input"
          placeholder="Ask about nutrition, macros, meal timing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={2}
          className="flex-1 resize-none rounded-xl text-sm"
          style={{
            background: "oklch(0.97 0.005 90)",
            border: "1.5px solid oklch(0.88 0.012 90)",
            color: "oklch(0.18 0.02 180)",
          }}
        />
        <button
          type="button"
          data-ocid="ai.chat.button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="btn-shimmer flex items-center justify-center rounded-xl font-semibold text-white transition-all hover:scale-[1.04] active:scale-[0.96] disabled:opacity-50"
          style={{
            height: 68,
            paddingLeft: 18,
            paddingRight: 18,
            background:
              "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            boxShadow: "0 4px 14px oklch(0.58 0.18 162 / 0.25)",
          }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AIAssistant({ actor, profile }: Props) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto" data-ocid="ai.page">
      {/* Header */}
      <div className="mb-7 animate-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
              boxShadow: "0 4px 14px oklch(0.58 0.18 162 / 0.3)",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              color: "oklch(0.13 0.02 180)",
            }}
          >
            AI Assistant
          </h1>
        </div>
        <p className="text-sm pl-14" style={{ color: "oklch(0.50 0.02 180)" }}>
          Intelligent meal planning, workout guidance, and nutrition coaching
          powered by AI.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="meals">
        <TabsList
          className="mb-6 h-11 rounded-xl"
          data-ocid="ai.tab"
          style={{
            background: "oklch(0.92 0.010 90)",
            border: "1px solid oklch(0.88 0.012 90)",
          }}
        >
          <TabsTrigger
            value="meals"
            data-ocid="ai.meals.tab"
            className="gap-1.5 rounded-lg text-sm font-medium transition-all data-[state=active]:text-white"
            style={{ fontFamily: "'Satoshi', sans-serif" }}
          >
            <ChefHat className="w-4 h-4" />
            Meal Suggestions
          </TabsTrigger>
          <TabsTrigger
            value="workout"
            data-ocid="ai.workout.tab"
            className="gap-1.5 rounded-lg text-sm font-medium transition-all data-[state=active]:text-white"
          >
            <Dumbbell className="w-4 h-4" />
            Workout Plan
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            data-ocid="ai.chat.tab"
            className="gap-1.5 rounded-lg text-sm font-medium transition-all data-[state=active]:text-white"
          >
            <MessageCircle className="w-4 h-4" />
            Nutrition Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meals">
          <MealSuggestionsTab actor={actor} profile={profile} />
        </TabsContent>
        <TabsContent value="workout">
          <WorkoutRecommendationTab actor={actor} profile={profile} />
        </TabsContent>
        <TabsContent value="chat">
          <div
            className="rounded-2xl p-5"
            style={{
              background: "oklch(0.995 0.002 90)",
              border: "1px solid oklch(0.90 0.008 90)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <NutritionChatTab actor={actor} profile={profile} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
