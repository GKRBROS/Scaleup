"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  LineChart as LineChartIcon,
  Users,
  Image as ImageIcon,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeRange = "day" | "week" | "month";
export type AnalyticsTheme = "light" | "dark";

interface OverviewMetrics {
  views: number;
  users: number;
  images: number;
  growth: number;
}

interface ViewsSeriesPoint {
  label: string;
  views: number;
}

interface RegistrationsSeriesPoint {
  label: string;
  registrations: number;
}

interface GenerationsSeriesPoint {
  label: string;
  generations: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  views: number;
  images: number;
  lastSeen: string;
}

interface AnalyticsSnapshot {
  overview: OverviewMetrics;
  series: {
    day: ViewsSeriesPoint[];
    week: ViewsSeriesPoint[];
    month: ViewsSeriesPoint[];
  };
  registrations: {
    day: RegistrationsSeriesPoint[];
    week: RegistrationsSeriesPoint[];
    month: RegistrationsSeriesPoint[];
  };
  generations: {
    day: GenerationsSeriesPoint[];
    week: GenerationsSeriesPoint[];
    month: GenerationsSeriesPoint[];
  };
  usersSplit: {
    newUsers: number;
    returningUsers: number;
  };
  leaderboard: LeaderboardUser[];
}

const baseSnapshot: AnalyticsSnapshot = {
  overview: {
    views: 0,
    users: 0,
    images: 0,
    growth: 0,
  },
  series: {
    day: [],
    week: [],
    month: [],
  },
  registrations: {
    day: [],
    week: [],
    month: [],
  },
  generations: {
    day: [],
    week: [],
    month: [],
  },
  usersSplit: {
    newUsers: 0,
    returningUsers: 0,
  },
  leaderboard: [],
};

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function getRangeLabel(range: TimeRange): string {
  if (range === "day") return "Last 24 hours";
  if (range === "week") return "Last 7 days";
  return "Last 30 days";
}

export function AnalyticsDashboard({ theme = "light" }: { theme?: AnalyticsTheme }) {
  const [range, setRange] = useState<TimeRange>("day");
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === "dark";

  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      setIsLoading(true);

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_ANALYTICS_BASE_URL ??
          "https://scaleup.frameforge.one";

        const backendRange =
          range === "day" ? "daily" : range === "week" ? "weekly" : "monthly";

        const [overviewRes, viewsRes, imagesRes, usersRes] = await Promise.all([
          fetch(`${baseUrl}/analytics/overview`),
          fetch(`${baseUrl}/analytics/views?range=${backendRange}`),
          fetch(`${baseUrl}/analytics/images?range=${backendRange}`),
          fetch(`${baseUrl}/analytics/users?range=${backendRange}`),
        ]);

        const [overviewJson, viewsJson, imagesJson, usersJson] =
          await Promise.all([
            overviewRes.json().catch(() => null),
            viewsRes.json().catch(() => null),
            imagesRes.json().catch(() => null),
            usersRes.json().catch(() => null),
          ]);

        if (cancelled) return;

        const overviewOk = overviewRes.ok && overviewJson?.success;
        const viewsOk = viewsRes.ok && viewsJson?.success;
        const imagesOk = imagesRes.ok && imagesJson?.success;
        const usersOk = usersRes.ok && usersJson?.success;

        if (!overviewOk && !viewsOk && !imagesOk && !usersOk) {
          setSnapshot(baseSnapshot);
          return;
        }

        const viewsSeriesSource =
          viewsOk && Array.isArray(viewsJson?.metrics?.series)
            ? viewsJson.metrics.series
            : [];

        const usersSeriesSource =
          usersOk && Array.isArray(usersJson?.metrics?.series)
            ? usersJson.metrics.series
            : [];

        const imagesSeriesSource =
          imagesOk && Array.isArray(imagesJson?.metrics?.series)
            ? imagesJson.metrics.series
            : [];

        const viewsSeriesMapped: ViewsSeriesPoint[] = viewsSeriesSource.map(
          (point: { label?: string; value?: number }) => ({
            label: point.label ?? "",
            views:
              typeof point.value === "number" && Number.isFinite(point.value)
                ? point.value
                : 0,
          }),
        );

        const registrationsSeriesMapped: RegistrationsSeriesPoint[] =
          usersSeriesSource.map((point: { label?: string; value?: number }) => ({
            label: point.label ?? "",
            registrations:
              typeof point.value === "number" && Number.isFinite(point.value)
                ? point.value
                : 0,
          }));

        const generationsSeriesMapped: GenerationsSeriesPoint[] =
          imagesSeriesSource.map((point: { label?: string; value?: number }) => ({
            label: point.label ?? "",
            generations:
              typeof point.value === "number" && Number.isFinite(point.value)
                ? point.value
                : 0,
          }));

        const growthRaw = viewsOk ? viewsJson.metrics?.growthPercentage : null;

        const overviewMetrics: OverviewMetrics = {
          views:
            viewsOk && typeof viewsJson.metrics?.total === "number"
              ? viewsJson.metrics.total
              : 0,
          users:
            usersOk && typeof usersJson.metrics?.total === "number"
              ? usersJson.metrics.total
              : 0,
          images:
            overviewOk &&
            typeof overviewJson.overview?.totalImages === "number"
              ? overviewJson.overview.totalImages
              : 0,
          growth:
            typeof growthRaw === "number" && Number.isFinite(growthRaw)
              ? growthRaw
              : 0,
        };

        const newSnapshot: AnalyticsSnapshot = {
          overview: overviewMetrics,
          series: {
            day: range === "day" ? viewsSeriesMapped : [],
            week: range === "week" ? viewsSeriesMapped : [],
            month: range === "month" ? viewsSeriesMapped : [],
          },
          registrations: {
            day: range === "day" ? registrationsSeriesMapped : [],
            week: range === "week" ? registrationsSeriesMapped : [],
            month: range === "month" ? registrationsSeriesMapped : [],
          },
          generations: {
            day: range === "day" ? generationsSeriesMapped : [],
            week: range === "week" ? generationsSeriesMapped : [],
            month: range === "month" ? generationsSeriesMapped : [],
          },
          usersSplit: baseSnapshot.usersSplit,
          leaderboard: baseSnapshot.leaderboard,
        };

        setSnapshot(newSnapshot);
      } catch {
        if (!cancelled) {
          setSnapshot(baseSnapshot);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [range, theme]);

  const overview = snapshot?.overview ?? baseSnapshot.overview;
  const viewsSeries = snapshot?.series[range] ?? baseSnapshot.series[range];
  const registrationsSeries =
    snapshot?.registrations[range] ?? baseSnapshot.registrations[range];
  const generationsSeries =
    snapshot?.generations[range] ?? baseSnapshot.generations[range];
  const usersSplit = snapshot?.usersSplit ?? baseSnapshot.usersSplit;
  const leaderboard = snapshot?.leaderboard ?? baseSnapshot.leaderboard;

  const safeNewUsers =
    typeof usersSplit.newUsers === "number" && Number.isFinite(usersSplit.newUsers)
      ? usersSplit.newUsers
      : 0;
  const safeReturningUsers =
    typeof usersSplit.returningUsers === "number" &&
    Number.isFinite(usersSplit.returningUsers)
      ? usersSplit.returningUsers
      : 0;
  const usersSplitTotal = safeNewUsers + safeReturningUsers;

  return (
    <div
      className={
        "min-h-screen " +
        (isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
          : "bg-gray-50 text-slate-900")
      }
    >
      <header
        className={
          "flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 sm:px-6 lg:px-10 pt-5 pb-4 border-b " +
          (isDark
            ? "border-white/10 bg-slate-950/80 backdrop-blur-xl"
            : "border-gray-200 bg-white")
        }
      >
        <div>
          <div
            className={
              "text-[11px] font-medium uppercase tracking-[0.16em] " +
              (isDark ? "text-slate-400" : "text-slate-500")
            }
          >
            Analytics
          </div>
          <h1
            className={
              "mt-1 text-xl sm:text-2xl lg:text-3xl font-semibold " +
              (isDark ? "text-slate-50" : "text-slate-900")
            }
          >
            Engagement and Avatar Performance
          </h1>
          <p
            className={
              "mt-1 text-xs sm:text-sm " +
              (isDark ? "text-slate-400" : "text-slate-500")
            }
          >
            Monitoring traffic, users, and AI avatar generation across the ScaleUp 2026 funnel.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1 md:mt-0">
          <div
            className={
              "hidden sm:flex items-center gap-2 rounded-full border px-2 py-2 text-xs " +
              (isDark
                ? "border-white/15 bg-slate-900/80"
                : "border-gray-200 bg-gray-50")
            }
          >
            {(["day", "week", "month"] as TimeRange[]).map((value) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={
                  "px-3.5 py-1.5 rounded-full transition text-[12px] font-medium" +
                  (range === value
                    ? isDark
                      ? " bg-slate-50 text-slate-950 shadow-sm"
                      : " bg-slate-900 text-white shadow-sm shadow-slate-900/30"
                    : isDark
                      ? " text-slate-300 hover:bg-white/10"
                      : " text-slate-500 hover:text-slate-900 hover:bg-gray-100")
                }
              >
                {value === "day" ? "Day" : value === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 pb-10 pt-4 space-y-5">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={Activity}
            label="Total Views"
            value={overview.views}
            suffix=""
            accent={
              isDark
                ? "from-indigo-500/90 to-sky-400/80"
                : "from-indigo-500/80 to-sky-400/70"
            }
            isDark={isDark}
            loading={isLoading}
          />
          <OverviewCard
            icon={Users}
            label="Total Users"
            value={overview.users}
            suffix=""
            accent={
              isDark
                ? "from-emerald-500/90 to-teal-400/80"
                : "from-emerald-500/80 to-teal-400/70"
            }
            isDark={isDark}
            loading={isLoading}
          />
          <OverviewCard
            icon={ImageIcon}
            label="Total Images Generated"
            value={overview.images}
            suffix=""
            accent={
              isDark
                ? "from-fuchsia-500/90 to-pink-400/80"
                : "from-fuchsia-500/80 to-pink-400/70"
            }
            isDark={isDark}
            loading={isLoading}
          />
          <OverviewCard
            icon={TrendingUp}
            label="Growth"
            value={overview.growth}
            suffix="%"
            accent={
              isDark
                ? "from-amber-500/90 to-orange-400/80"
                : "from-amber-500/80 to-orange-400/70"
            }
            isPercent
            isDark={isDark}
            loading={isLoading}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              "lg:col-span-2 rounded-3xl border p-4 sm:p-5 flex flex-col " +
              (isDark
                ? "border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/40"
                : "border-gray-200 bg-white shadow-sm")
            }
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div
                  className={
                    "flex items-center gap-2 text-xs " +
                    (isDark ? "text-slate-300" : "text-slate-500")
                  }
                >
                  <LineChartIcon className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Views</span>
                </div>
                <div
                  className={
                    "mt-0.5 text-sm font-semibold " +
                    (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  Engagement over time
                </div>
                <div
                  className={
                    "text-[11px] " +
                    (isDark ? "text-slate-400" : "text-slate-500")
                  }
                >
                  {getRangeLabel(range)}
                </div>
              </div>
              <div
                className={
                  "flex sm:hidden items-center gap-2 rounded-full border px-2 py-2 text-[12px] " +
                  (isDark
                    ? "border-white/15 bg-slate-900/80"
                    : "border-gray-200 bg-gray-50")
                }
              >
                {(["day", "week", "month"] as TimeRange[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => setRange(value)}
                    className={
                      "px-3 py-1.5 rounded-full transition font-medium" +
                      (range === value
                        ? isDark
                          ? " bg-slate-50 text-slate-950 shadow-sm"
                          : " bg-slate-900 text-white"
                        : isDark
                          ? " text-slate-300 hover:bg-white/10"
                          : " text-slate-500 hover:text-slate-900 hover:bg-gray-100")
                    }
                  >
                    {value === "day" ? "Day" : value === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex-1 min-h-[220px]">
              {isLoading ? (
                <div
                  className={
                    "absolute inset-0 rounded-2xl border animate-pulse " +
                    (isDark
                      ? "bg-slate-900/60 border-white/15"
                      : "bg-gray-100 border-gray-200")
                  }
                />
              ) : viewsSeries.length === 0 ? (
                <div
                  className={
                    "absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed " +
                    (isDark
                      ? "border-white/15 bg-slate-900/60"
                      : "border-gray-200 bg-gray-50")
                  }
                >
                  <p
                    className={
                      "text-xs " + (isDark ? "text-slate-400" : "text-slate-500")
                    }
                  >
                    No engagement data available for this range yet.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsSeries} margin={{ left: -16, right: 8, top: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        padding: "8px 10px",
                        color: "#0f172a",
                        fontSize: 11,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 11,
                        color: "#9ca3af",
                        paddingTop: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="url(#viewsGradient)"
                      strokeWidth={2.4}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="50%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#22C55E" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className={
              "rounded-3xl border p-4 flex flex-col " +
              (isDark
                ? "border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/40"
                : "border-gray-200 bg-white shadow-sm")
            }
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div
                  className={
                    "flex items-center gap-2 text-xs " +
                    (isDark ? "text-slate-300" : "text-slate-500")
                  }
                >
                  <span>Image Generations</span>
                </div>
                <div
                  className={
                    "mt-0.5 text-sm font-semibold " +
                    (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  AI avatar volume
                </div>
                <div
                  className={
                    "text-[11px] " +
                    (isDark ? "text-slate-400" : "text-slate-500")
                  }
                >
                  {getRangeLabel(range)}
                </div>
              </div>
            </div>
            <div className="relative flex-1 min-h-[200px]">
              {isLoading ? (
                <div
                  className={
                    "absolute inset-0 rounded-2xl border animate-pulse " +
                    (isDark
                      ? "bg-slate-900/60 border-white/15"
                      : "bg-gray-100 border-gray-200")
                  }
                />
              ) : generationsSeries.length === 0 ? (
                <div
                  className={
                    "absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed " +
                    (isDark
                      ? "border-white/15 bg-slate-900/60"
                      : "border-gray-200 bg-gray-50")
                  }
                >
                  <p
                    className={
                      "text-xs " + (isDark ? "text-slate-400" : "text-slate-500")
                    }
                  >
                    No image generation data available for this range yet.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={generationsSeries}
                    margin={{ left: -16, right: 8, top: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.16)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        padding: "8px 10px",
                        color: "#0f172a",
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="generations" radius={[4, 4, 0, 0]} fill="#F97316" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={
              "rounded-3xl border p-4 flex flex-col " +
              (isDark
                ? "border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/40"
                : "border-gray-200 bg-white shadow-sm")
            }
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div
                  className={
                    "flex items-center gap-2 text-xs " +
                    (isDark ? "text-slate-300" : "text-slate-500")
                  }
                >
                  <span>Registrations</span>
                </div>
                <div
                  className={
                    "mt-0.5 text-sm font-semibold " +
                    (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  Ticket and avatar signups
                </div>
                <div
                  className={
                    "text-[11px] " +
                    (isDark ? "text-slate-400" : "text-slate-500")
                  }
                >
                  {getRangeLabel(range)}
                </div>
              </div>
            </div>
            <div className="relative flex-1 min-h-[200px]">
              {isLoading ? (
                <div
                  className={
                    "absolute inset-0 rounded-2xl border animate-pulse " +
                    (isDark
                      ? "bg-slate-900/60 border-white/15"
                      : "bg-gray-100 border-gray-200")
                  }
                />
              ) : registrationsSeries.length === 0 ? (
                <div
                  className={
                    "absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed " +
                    (isDark
                      ? "border-white/15 bg-slate-900/60"
                      : "border-gray-200 bg-gray-50")
                  }
                >
                  <p
                    className={
                      "text-xs " + (isDark ? "text-slate-400" : "text-slate-500")
                    }
                  >
                    No registration data available for this range yet.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={registrationsSeries}
                    margin={{ left: -16, right: 8, top: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.16)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        padding: "8px 10px",
                        color: "#0f172a",
                        fontSize: 11,
                      }}
                    />
                    <Bar
                      dataKey="registrations"
                      radius={[4, 4, 0, 0]}
                      fill="#22C55E"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={
              "rounded-3xl border p-4 flex flex-col " +
              (isDark
                ? "border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/40"
                : "border-gray-200 bg-white shadow-sm")
            }
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div
                  className={
                    "flex items-center gap-2 text-xs " +
                    (isDark ? "text-slate-300" : "text-slate-500")
                  }
                >
                  <span>Audience mix</span>
                </div>
                <div
                  className={
                    "mt-0.5 text-sm font-semibold " +
                    (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  New vs returning
                </div>
              </div>
            </div>
            <div className="relative flex-1 min-h-[200px]">
              {usersSplitTotal === 0 ? (
                <div
                  className={
                    "absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed " +
                    (isDark
                      ? "border-white/15 bg-slate-900/60"
                      : "border-gray-200 bg-gray-50")
                  }
                >
                  <p
                    className={
                      "text-xs " + (isDark ? "text-slate-400" : "text-slate-500")
                    }
                  >
                    No audience split data available yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 h-full justify-center">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={isDark ? "text-slate-300" : "text-slate-600"}
                    >
                      New users
                    </span>
                    <span className="font-semibold">
                      {safeNewUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{
                        width: `${Math.min(
                          100,
                          usersSplitTotal === 0
                            ? 0
                            : (safeNewUsers / usersSplitTotal) * 100 || 0,
                        ).toFixed(1)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={isDark ? "text-slate-300" : "text-slate-600"}
                    >
                      Returning users
                    </span>
                    <span className="font-semibold">
                      {safeReturningUsers.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        <section className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className={
              "rounded-3xl border p-4 sm:p-5 flex flex-col gap-3 " +
              (isDark
                ? "border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/40"
                : "border-gray-200 bg-white shadow-sm")
            }
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div
                  className={
                    "text-[11px] font-medium " +
                    (isDark ? "text-slate-400" : "text-slate-500")
                  }
                >
                  Leaderboard
                </div>
                <div
                  className={
                    "mt-0.5 text-sm font-semibold " +
                    (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  Top active users
                </div>
                <div
                  className={
                    "text-[11px] " +
                    (isDark ? "text-slate-500" : "text-slate-500")
                  }
                >
                  Ranked by views and avatar downloads
                </div>
              </div>
            </div>
            {leaderboard.length === 0 ? (
              <div
                className={
                  "flex-1 flex items-center justify-center rounded-2xl border border-dashed px-4 py-10 " +
                  (isDark
                    ? "border-white/15 bg-slate-900/60"
                    : "border-gray-200 bg-gray-50")
                }
              >
                <p
                  className={
                    "text-xs " + (isDark ? "text-slate-400" : "text-slate-500")
                  }
                >
                  No leaderboard data available yet.
                </p>
              </div>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead
                    className={isDark ? "text-slate-400" : "text-slate-500"}
                  >
                    <tr>
                      <th className="py-2 pr-4 text-left font-medium">Rank</th>
                      <th className="py-2 pr-4 text-left font-medium">User</th>
                      <th className="py-2 pr-4 text-left font-medium">Email</th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Views
                      </th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Images
                      </th>
                      <th className="py-2 text-right font-medium">
                        Last active
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={isDark ? "text-slate-200" : "text-slate-800"}
                  >
                    {leaderboard.slice(0, 10).map((user, index) => {
                      const views =
                        typeof user.views === "number" && Number.isFinite(user.views)
                          ? user.views
                          : 0;
                      const images =
                        typeof user.images === "number" && Number.isFinite(user.images)
                          ? user.images
                          : 0;

                      return (
                        <tr key={user.id} className="border-t border-slate-800/40">
                          <td className="py-2 pr-4">{index + 1}</td>
                          <td className="py-2 pr-4">{user.name}</td>
                          <td className="py-2 pr-4 truncate max-w-[160px]">
                            {user.email}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {views.toLocaleString()}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {images.toLocaleString()}
                          </td>
                          <td className="py-2 text-right">{user.lastSeen}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

interface OverviewCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix: string;
  accent: string;
  loading: boolean;
  isPercent?: boolean;
  isDark: boolean;
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  suffix,
  accent,
  loading,
  isPercent,
  isDark,
}: OverviewCardProps) {
  return (
    <div
      className={
        "rounded-3xl border px-4 py-3.5 flex flex-col gap-2 shadow-sm " +
        (isDark
          ? "border-white/10 bg-slate-900/80 shadow-slate-950/40"
          : "border-gray-200 bg-white")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div
            className={
              "text-[11px] font-medium " +
              (isDark ? "text-slate-400" : "text-slate-500")
            }
          >
            {label}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            {loading ? (
              <div
                className={
                  "h-5 w-16 rounded-full animate-pulse " +
                  (isDark ? "bg-slate-800" : "bg-gray-100")
                }
              />
            ) : (
              <>
                <div
                  className={
                    "text-lg font-semibold " +
                    (isDark ? "text-slate-50" : "text-slate-900")
                  }
                >
                  {isPercent ? value.toFixed(1) : formatNumber(value)}
                </div>
                {suffix && (
                  <div className="text-[11px] font-medium text-slate-400">
                    {suffix}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div
          className={
            "h-8 w-8 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-sm shadow-slate-900/10 " +
            accent
          }
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
