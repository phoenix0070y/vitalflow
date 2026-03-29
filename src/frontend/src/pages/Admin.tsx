import { Activity, Dumbbell, Users, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UserProfile, backendInterface } from "../backend";

interface Props {
  actor: backendInterface | null;
}

const ENGAGEMENT_DATA = [
  { month: "Oct", newUsers: 12, activeUsers: 8 },
  { month: "Nov", newUsers: 19, activeUsers: 14 },
  { month: "Dec", newUsers: 25, activeUsers: 20 },
  { month: "Jan", newUsers: 31, activeUsers: 26 },
  { month: "Feb", newUsers: 38, activeUsers: 32 },
  { month: "Mar", newUsers: 45, activeUsers: 40 },
];

export default function Admin({ actor }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllUserProfiles()
      .then((u) => {
        setUsers(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor]);

  const totalUsers = users.length;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeUsers = users.filter(
    (u) => Number(u.last_active) / 1_000_000 > sevenDaysAgo,
  ).length;

  const goalCounts = users.reduce(
    (acc, u) => {
      acc[u.goal] = (acc[u.goal] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111214]">Admin Dashboard</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Platform overview and user management
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Users",
            value: totalUsers || "—",
            icon: <Users className="w-5 h-5" />,
            color: "#2F8F7A",
            bg: "#DDF2E3",
          },
          {
            label: "Active (7d)",
            value: activeUsers || "—",
            icon: <Activity className="w-5 h-5" />,
            color: "#7FCB8D",
            bg: "#F0FFF4",
          },
          {
            label: "Meal Plans",
            value: "6",
            icon: <UtensilsCrossed className="w-5 h-5" />,
            color: "#E9896A",
            bg: "#FFF0EB",
          },
          {
            label: "Workouts",
            value: "6",
            icon: <Dumbbell className="w-5 h-5" />,
            color: "#6B7280",
            bg: "#F5F6F7",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-[#E6E8EB] shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#6B7280]">
                {s.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Engagement chart */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E6E8EB] shadow-sm p-5">
          <h3 className="font-semibold text-[#111214] text-sm mb-4">
            User Engagement Metrics
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ENGAGEMENT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="New Users"
                stroke="#2F8F7A"
                strokeWidth={2.5}
                dot={{ fill: "#2F8F7A", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#7FCB8D"
                strokeWidth={2.5}
                dot={{ fill: "#7FCB8D", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Stats */}
        <div className="bg-white rounded-xl border border-[#E6E8EB] shadow-sm p-5">
          <h3 className="font-semibold text-[#111214] text-sm mb-4">
            Key Stats
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Total Users",
                value: totalUsers > 0 ? `${totalUsers}` : "0",
                color: "#2F8F7A",
              },
              { label: "Total Plans", value: "12", color: "#7FCB8D" },
              { label: "Avg. Daily Logs", value: "8.4", color: "#E9896A" },
            ].map((s) => (
              <div
                key={s.label}
                className="border-b border-[#E6E8EB] pb-4 last:border-0 last:pb-0"
              >
                <div className="text-xs text-[#6B7280] mb-1">{s.label}</div>
                <div className="text-3xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal distribution */}
      {Object.keys(goalCounts).length > 0 && (
        <div className="bg-white rounded-xl border border-[#E6E8EB] shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-[#111214] text-sm mb-4">
            User Goals Distribution
          </h3>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(goalCounts).map(([goal, count]) => (
              <div
                key={goal}
                className="bg-[#F5F6F7] rounded-xl p-3 text-center min-w-24"
              >
                <div className="text-2xl font-bold text-[#2F8F7A]">{count}</div>
                <div className="text-xs text-[#6B7280] capitalize mt-1">
                  {goal.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl border border-[#E6E8EB] shadow-sm p-5">
        <h3 className="font-semibold text-[#111214] text-sm mb-4">
          Registered Users
        </h3>
        {loading ? (
          <div className="text-center py-8 text-[#6B7280]">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]">
            No registered users yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6E8EB]">
                  <th className="text-left py-2 font-medium text-[#6B7280]">
                    Name
                  </th>
                  <th className="text-left py-2 font-medium text-[#6B7280]">
                    Goal
                  </th>
                  <th className="text-left py-2 font-medium text-[#6B7280]">
                    Dietary
                  </th>
                  <th className="text-right py-2 font-medium text-[#6B7280]">
                    Daily Calories
                  </th>
                  <th className="text-right py-2 font-medium text-[#6B7280]">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: server data without stable id
                    key={`user-${u.name}-${i}`}
                    className="border-b border-[#E6E8EB] last:border-0"
                  >
                    <td className="py-2.5 font-medium text-[#111214]">
                      {u.name}
                    </td>
                    <td className="py-2.5 text-[#6B7280] capitalize">
                      {u.goal.replace("_", " ")}
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {u.dietary_restrictions.slice(0, 2).map((r) => (
                          <span
                            key={r}
                            className="text-xs bg-[#DDF2E3] text-[#1F7A3A] px-2 py-0.5 rounded-full capitalize"
                          >
                            {r}
                          </span>
                        ))}
                        {u.dietary_restrictions.length > 2 && (
                          <span className="text-xs text-[#6B7280]">
                            +{u.dietary_restrictions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-[#111214]">
                      {Number(u.daily_calories)} kcal
                    </td>
                    <td className="py-2.5 text-right text-[#6B7280] text-xs">
                      {new Date(
                        Number(u.last_active) / 1_000_000,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
