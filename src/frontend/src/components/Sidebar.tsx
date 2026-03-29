import {
  ChevronRight,
  Dumbbell,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import type { Page } from "../App";
import type { UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  activePage: Page;
  setActivePage: (p: Page) => void;
  isAdmin: boolean;
  profile: UserProfile;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
  },
  {
    id: "meals",
    label: "Meals",
    icon: <UtensilsCrossed className="w-[18px] h-[18px]" />,
  },
  {
    id: "ai",
    label: "AI Assistant",
    icon: <Sparkles className="w-[18px] h-[18px]" />,
  },
  {
    id: "workouts",
    label: "Workouts",
    icon: <Dumbbell className="w-[18px] h-[18px]" />,
  },
  {
    id: "progress",
    label: "Progress",
    icon: <TrendingUp className="w-[18px] h-[18px]" />,
  },
];

export default function Sidebar({
  activePage,
  setActivePage,
  isAdmin,
  profile,
}: Props) {
  const { clear } = useInternetIdentity();

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col min-h-screen relative overflow-hidden sidebar-mesh"
      style={{
        background: "oklch(0.15 0.05 155)",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute -top-16 -left-16 w-52 h-52 rounded-full pointer-events-none"
        style={{
          background: "oklch(0.58 0.18 162 / 0.07)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-20 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "oklch(0.35 0.12 160 / 0.12)",
          filter: "blur(32px)",
        }}
      />

      {/* Brand */}
      <div className="relative p-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            boxShadow: "0 2px 12px oklch(0.58 0.18 162 / 0.4)",
          }}
        >
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <span
            className="text-white text-[1.15rem] font-bold tracking-tight leading-none"
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

      {/* User info */}
      <div className="relative px-4 mb-5">
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{
            background: "oklch(0.22 0.06 155 / 0.7)",
            border: "1px solid oklch(0.30 0.05 155)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.58 0.18 162) 0%, oklch(0.35 0.12 160) 100%)",
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">
              {profile.name}
            </div>
            <div
              className="text-xs capitalize"
              style={{ color: "oklch(0.58 0.18 162)" }}
            >
              {profile.goal.replace("_", " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Divider label */}
      <div className="relative px-5 mb-2">
        <span
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "oklch(0.45 0.06 155)" }}
        >
          Navigation
        </span>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setActivePage(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive ? "text-white nav-active-glow" : "hover:text-white"
              }`}
              style={{
                background: isActive
                  ? "oklch(0.22 0.06 155 / 0.85)"
                  : "transparent",
                color: isActive ? "white" : "oklch(0.72 0.06 160)",
              }}
            >
              <span
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <ChevronRight
                  className="w-3.5 h-3.5 animate-slide-in-left"
                  style={{ color: "oklch(0.58 0.18 162)" }}
                />
              )}
            </button>
          );
        })}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActivePage("admin")}
            data-ocid="nav.admin.link"
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
              activePage === "admin"
                ? "text-white nav-active-glow"
                : "hover:text-white"
            }`}
            style={{
              background:
                activePage === "admin"
                  ? "oklch(0.22 0.06 155 / 0.85)"
                  : "transparent",
              color: activePage === "admin" ? "white" : "oklch(0.72 0.06 160)",
            }}
          >
            <ShieldCheck className="w-[18px] h-[18px]" />
            <span className="flex-1 text-left">Admin</span>
            {activePage === "admin" && (
              <ChevronRight
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.58 0.18 162)" }}
              />
            )}
          </button>
        )}
      </nav>

      {/* Bottom */}
      <div
        className="relative p-3 space-y-0.5 mt-4"
        style={{ borderTop: "1px solid oklch(0.25 0.04 155)" }}
      >
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:text-white"
          style={{ color: "oklch(0.60 0.05 155)" }}
        >
          <Settings className="w-[18px] h-[18px]" />
          Settings
        </button>
        <button
          type="button"
          onClick={clear}
          data-ocid="nav.logout.button"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:text-white"
          style={{ color: "oklch(0.60 0.05 155)" }}
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>

        {/* Footer attribution */}
        <div className="pt-3 pb-1 px-4">
          <p className="text-[10px]" style={{ color: "oklch(0.40 0.04 155)" }}>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: "oklch(0.50 0.08 162)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}
