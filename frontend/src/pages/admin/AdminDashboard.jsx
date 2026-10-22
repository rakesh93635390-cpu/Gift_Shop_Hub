import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  Store,
  Package,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

const dashboardCards = [
  {
    title: "Total Shops",
    key: "totalShops",
    icon: Store,
    color: "pink",
    description: "Registered shops",
  },
  {
    title: "Total Products",
    key: "totalProducts",
    icon: Package,
    color: "blue",
    description: "Available products",
  },
  {
    title: "Total Users",
    key: "totalUsers",
    icon: Users,
    color: "purple",
    description: "Registered users",
  },
  {
    title: "Total Orders",
    key: "totalOrders",
    icon: ShoppingBag,
    color: "sky",
    description: "Orders received",
  },
];

const colorStyles = {
  pink: {
    icon: "bg-pink-100 text-pink-600",
    border: "hover:border-pink-300",
    glow: "hover:shadow-pink-100",
  },
  blue: {
    icon: "bg-blue-100 text-blue-600",
    border: "hover:border-blue-300",
    glow: "hover:shadow-blue-100",
  },
  purple: {
    icon: "bg-purple-100 text-purple-600",
    border: "hover:border-purple-300",
    glow: "hover:shadow-purple-100",
  },
  sky: {
    icon: "bg-sky-100 text-sky-600",
    border: "hover:border-sky-300",
    glow: "hover:shadow-sky-100",
  },
};

export default function AdminDashboard() {
  const [loaded, setLoaded] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view dashboard analytics.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = response.data?.analytics;
      const keys = ["totalShops", "totalProducts", "totalUsers", "totalOrders"];

      if (!data || !keys.every((key) => Number.isFinite(data[key]))) {
        throw new Error(
          "Unexpected response while retrieving dashboard analytics."
        );
      }

      setAnalytics(data);
    } catch (requestError) {
      if (requestError.name === "CanceledError") return;

      console.error("Failed to load dashboard analytics:", requestError);
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load dashboard analytics."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoaded(true);
    const controller = new AbortController();
    loadAnalytics(controller.signal);

    return () => controller.abort();
  }, [loadAnalytics]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="relative isolate min-w-0 p-4 pt-24 sm:p-6 sm:pt-24 lg:ml-[270px] lg:p-8">
        <style>{`
          @keyframes admin-dashboard-float {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(0, -16px, 0) scale(1.05); }
          }

          @media (prefers-reduced-motion: reduce) {
            .admin-dashboard-float { animation: none !important; }
          }
        `}</style>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <span
            className="admin-dashboard-float absolute -right-16 top-24 h-64 w-64 rounded-full bg-pink-200/30 blur-3xl"
            style={{ animation: "admin-dashboard-float 11s ease-in-out infinite" }}
          />
          <span
            className="admin-dashboard-float absolute left-[18%] top-[42%] h-52 w-52 rounded-full bg-sky-200/25 blur-3xl"
            style={{
              animation: "admin-dashboard-float 14s ease-in-out 1.5s infinite",
            }}
          />
          <span
            className="admin-dashboard-float absolute bottom-8 right-[22%] h-44 w-44 rounded-full bg-blue-200/25 blur-3xl"
            style={{
              animation: "admin-dashboard-float 12s ease-in-out 3s infinite",
            }}
          />
        </div>

        {/* Header */}
        <header
          className={`mb-8 flex flex-col gap-4 transition-all duration-700 sm:flex-row sm:items-center sm:justify-between ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-pink-500">
              Giftify Admin Panel
            </p>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Deshboard{" "}
              <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Welcome back! Here&apos;s what&apos;s happening in your store.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
            <TrendingUp size={20} className="text-blue-500" />
            <span className="text-sm font-medium text-slate-600">
              Store Overview
            </span>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-600"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadAnalytics()}
              className="inline-flex items-center gap-2 font-semibold hover:text-rose-700"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <section
          aria-label="Dashboard statistics"
          aria-busy={loading}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
        >
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            const styles = colorStyles[card.color];

            return (
              <article
                key={card.title}
                className={`group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl sm:p-6 ${styles.border} ${styles.glow} ${
                  loaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tabular-nums text-slate-800 transition-colors duration-300 group-hover:text-pink-600 sm:text-4xl">
                      {loading ? "..." : (analytics?.[card.key] ?? "—")}
                    </h2>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                      <ArrowUpRight size={14} className="text-blue-500" />
                      {card.description}
                    </p>
                  </div>

                  <div
                    className={`shrink-0 rounded-2xl p-3 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 sm:p-4 ${styles.icon}`}
                  >
                    <Icon size={25} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full w-1/3 rounded-full transition-all duration-700 group-hover:w-full ${
                      card.color === "pink"
                        ? "bg-pink-400"
                        : card.color === "blue"
                          ? "bg-blue-400"
                          : card.color === "purple"
                            ? "bg-purple-400"
                            : "bg-sky-400"
                    }`}
                  />
                </div>
              </article>
            );
          })}
        </section>

        {/* Welcome Panel */}
        <section
          className={`mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-pink-500 to-blue-500 p-6 text-white shadow-lg transition-all delay-300 duration-700 sm:mt-8 sm:p-8 ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Manage your Giftify store
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
                Manage shops, products, users and orders from one place.
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center self-start rounded-2xl bg-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
              <Store size={32} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}