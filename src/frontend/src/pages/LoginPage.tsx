import { Apple, Dumbbell, Leaf, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "oklch(0.97 0.005 90)" }}
    >
      {/* Left branding panel */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "oklch(0.15 0.05 155)" }}
      >
        {/* Mesh texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none sidebar-mesh"
          style={{ opacity: 1 }}
        />

        {/* Floating blobs */}
        <div
          className="absolute top-16 right-8 w-72 h-72 rounded-full pointer-events-none animate-float-orb"
          style={{
            background: "oklch(0.58 0.18 162 / 0.12)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-32 left-0 w-80 h-80 rounded-full pointer-events-none animate-float-orb-alt"
          style={{
            background: "oklch(0.35 0.12 160 / 0.18)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full pointer-events-none animate-float-orb-slow"
          style={{
            background: "oklch(0.58 0.18 162 / 0.08)",
            filter: "blur(40px)",
          }}
        />

        {/* Brand */}
        <div
          className="relative flex items-center gap-3 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
              boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.4)",
            }}
          >
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <span
              className="text-white text-2xl font-bold tracking-tight leading-none"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              }}
            >
              VitalFlow
            </span>
            <div
              className="text-[10px] tracking-widest uppercase"
              style={{ color: "oklch(0.58 0.18 162)" }}
            >
              Health OS
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "oklch(0.58 0.18 162)" }}
            >
              Your personal health companion
            </p>
            <h1
              className="text-white text-5xl font-bold leading-[1.1] mb-6"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              }}
            >
              Your journey
              <br />
              to a healthier
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.58 0.18 162), oklch(0.75 0.14 140))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                life starts here.
              </span>
            </h1>
            <p
              className="text-lg mb-12"
              style={{ color: "oklch(0.65 0.06 160)" }}
            >
              Track calories, plan meals, crush workouts.
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-4 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {[
              {
                icon: <Apple className="w-5 h-5" />,
                label: "Smart Meals",
                desc: "Allergy-aware",
              },
              {
                icon: <Dumbbell className="w-5 h-5" />,
                label: "Workouts",
                desc: "Goal-based plans",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                label: "Tracking",
                desc: "Macros & calories",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-4 transition-all hover:scale-105 duration-200"
                style={{
                  background: "oklch(0.22 0.06 155 / 0.7)",
                  border: "1px solid oklch(0.30 0.05 155)",
                }}
              >
                <div className="mb-2" style={{ color: "oklch(0.58 0.18 162)" }}>
                  {item.icon}
                </div>
                <div className="text-white font-semibold text-sm">
                  {item.label}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.60 0.06 160)" }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="relative text-xs"
          style={{ color: "oklch(0.40 0.04 155)" }}
        >
          &copy; {new Date().getFullYear()} Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            style={{ color: "oklch(0.50 0.08 162)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden animate-fade-up">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
              }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                color: "oklch(0.13 0.02 180)",
              }}
            >
              VitalFlow
            </span>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2
              className="text-3xl font-bold mb-1"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                color: "oklch(0.13 0.02 180)",
              }}
            >
              Welcome back
            </h2>
            <p className="mb-8" style={{ color: "oklch(0.50 0.02 180)" }}>
              Sign in to continue your health journey
            </p>
          </div>

          <div
            className="rounded-2xl p-8 animate-scale-in"
            style={{
              animationDelay: "140ms",
              background: "oklch(0.995 0.002 90)",
              border: "1px solid oklch(0.90 0.008 90)",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.18 162 / 0.15) 0%, oklch(0.35 0.12 160 / 0.10) 100%)",
                }}
              >
                <Leaf
                  className="w-8 h-8"
                  style={{ color: "oklch(0.35 0.12 160)" }}
                />
              </div>
              <h3
                className="font-bold text-lg mb-1"
                style={{
                  fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                  color: "oklch(0.13 0.02 180)",
                }}
              >
                Sign in with Internet Identity
              </h3>
              <p className="text-sm" style={{ color: "oklch(0.50 0.02 180)" }}>
                Secure, private authentication on the Internet Computer
              </p>
            </div>

            <button
              type="button"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.submit_button"
              className="btn-shimmer w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                boxShadow: "0 4px 16px oklch(0.58 0.18 162 / 0.3)",
                fontFamily: "'Satoshi', sans-serif",
              }}
            >
              {isLoggingIn ? "Connecting..." : "Connect with Internet Identity"}
            </button>

            <p
              className="text-xs text-center mt-4"
              style={{ color: "oklch(0.60 0.02 180)" }}
            >
              Your data is stored securely on the Internet Computer blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
