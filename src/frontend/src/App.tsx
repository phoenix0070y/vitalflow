import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import type { UserProfile } from "./backend";
import Sidebar from "./components/Sidebar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AIAssistant from "./pages/AIAssistant";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import Meals from "./pages/Meals";
import Onboarding from "./pages/Onboarding";
import Progress from "./pages/Progress";
import Workouts from "./pages/Workouts";

export type Page =
  | "dashboard"
  | "meals"
  | "workouts"
  | "progress"
  | "admin"
  | "ai";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor } = useActor();
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [profile, setProfile] = useState<UserProfile | null | undefined>(
    undefined,
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (actor && isAuthenticated) {
      actor
        .getCallerUserProfile()
        .then((p) => setProfile(p))
        .catch(() => setProfile(null));
      actor
        .isCallerAdmin()
        .then(setIsAdmin)
        .catch(() => setIsAdmin(false));
    } else if (!isAuthenticated) {
      setProfile(undefined);
    }
  }, [actor, isAuthenticated]);

  if (isInitializing || (profile === undefined && isAuthenticated)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.15 0.05 155)" }}
      >
        <div className="text-center animate-fade-up">
          {/* Branded spinner */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                opacity: 0.15,
              }}
            />
            <svg
              aria-hidden="true"
              className="w-16 h-16 animate-spin"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animationDuration: "1s" }}
            >
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="oklch(0.25 0.05 155)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="oklch(0.58 0.18 162)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="60 104"
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="white"
                  className="w-3 h-3"
                >
                  <path d="M8 1C8 1 3 4 3 8.5C3 11.5 5.2 14 8 14C10.8 14 13 11.5 13 8.5C13 4 8 1 8 1Z" />
                </svg>
              </div>
            </div>
          </div>
          <p
            className="font-semibold text-sm tracking-wide"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              color: "oklch(0.65 0.06 160)",
            }}
          >
            Loading VitalFlow...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <LoginPage />
      </>
    );
  }

  if (profile === null) {
    return (
      <>
        <Toaster richColors position="top-right" />
        <Onboarding onComplete={(p) => setProfile(p)} actor={actor} />
      </>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "oklch(0.97 0.005 90)" }}
    >
      <Toaster richColors position="top-right" />
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isAdmin={isAdmin}
        profile={profile!}
      />
      <main className="flex-1 overflow-auto">
        {activePage === "dashboard" && (
          <Dashboard actor={actor} profile={profile!} />
        )}
        {activePage === "meals" && <Meals actor={actor} profile={profile!} />}
        {activePage === "workouts" && <Workouts actor={actor} />}
        {activePage === "progress" && (
          <Progress actor={actor} profile={profile!} />
        )}
        {activePage === "ai" && (
          <AIAssistant actor={actor} profile={profile!} />
        )}
        {activePage === "admin" && isAdmin && <Admin actor={actor} />}
      </main>
    </div>
  );
}
