import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Gift,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { getOrderHistory } from "../services/orderHistoryService";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatOrderDate = (order) => {
  const date = order.createdAt || order.orderDate || order._id?.substring(0, 8);
  const parsedDate =
    order.createdAt || order.orderDate
      ? new Date(date)
      : order._id?.length === 24
        ? new Date(parseInt(order._id.substring(0, 8), 16) * 1000)
        : null;

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusStyle = (status = "pending") => {
  const normalizedStatus = status.toLowerCase();
  if (["delivered", "completed"].includes(normalizedStatus)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "canceled", "failed"].includes(normalizedStatus)) {
    return "border-rose-200 bg-rose-50 text-rose-600";
  }
  if (["shipped", "dispatched", "out for delivery"].includes(normalizedStatus)) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const orderList = await getOrderHistory();
      setOrders(orderList);
    } catch (requestError) {
      if (
        requestError.response?.status === 401 ||
        requestError.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load your order history."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen w-full min-w-0 bg-gradient-to-br from-sky-50 via-white to-pink-50 lg:ml-[270px] lg:w-[calc(100%-270px)]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:py-8">
        <header className="shop-reveal relative mb-7 overflow-hidden rounded-[1.75rem] border border-white bg-gradient-to-r from-pink-500 via-rose-400 to-sky-500 px-5 py-7 text-white shadow-xl shadow-pink-100 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 animate-pulse rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 animate-pulse rounded-full bg-sky-200/30 blur-3xl [animation-delay:800ms]" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm">
              <Sparkles size={15} className="animate-pulse" />
              Moments made memorable
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Your order history
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              Keep track of every thoughtful gift and the joy it brings.
            </p>
          </div>
          <Gift
            aria-hidden="true"
            className="absolute bottom-4 right-6 hidden rotate-12 text-white/25 sm:block"
            size={82}
          />
        </header>

        {loading ? (
          <section className="shop-reveal rounded-3xl border border-sky-100 bg-white p-10 text-center shadow-lg shadow-sky-100/50">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-pink-500"
            />
            <p className="mt-4 font-semibold text-slate-600">
              Gathering your lovely orders...
            </p>
          </section>
        ) : error ? (
          <section className="shop-reveal rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-lg shadow-rose-100/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Package size={26} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-800">
              We couldn’t load your orders
            </h2>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </section>
        ) : orders.length === 0 ? (
          <section className="shop-reveal relative overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white px-5 py-9 text-center shadow-lg shadow-sky-100/60 sm:px-8 sm:py-11">
            <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-pink-100/70 blur-2xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-sky-100/80 blur-2xl" />
            <div className="relative mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-sky-100 text-pink-500 shadow-inner">
              <ShoppingBag size={34} />
            </div>
            <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.22em] text-sky-600">
              A little joy awaits
            </p>
            <h2 className="relative mt-1.5 text-xl font-black text-slate-800 sm:text-2xl">
              No orders just yet
            </h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              Your order story starts with a thoughtful gift. Explore the
              collection and find something special.
            </p>
            <Link
              to="/products"
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Gift size={18} />
              Explore gifts
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                  Made with care
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-800">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}
                </h2>
              </div>
            </div>

            {orders.map((order, index) => {
              const orderId = order._id || order.id || "Unavailable";
              const orderDate = formatOrderDate(order);
              const status = order.orderStatus || "pending";
              const products = Array.isArray(order.products)
                ? order.products
                : [];
              const hasProductPrices =
                products.length > 0 &&
                products.every((item) => {
                  const product =
                    typeof item.productId === "object" && item.productId !== null
                      ? item.productId
                      : null;
                  return product?.productPrice != null;
                });
              const orderTotal = hasProductPrices
                ? products.reduce((total, item) => {
                    const product = item.productId;
                    return (
                      total +
                      Number(product.productPrice) * Number(item.quantity || 1)
                    );
                  }, 0)
                : order.totalPrice;

              return (
                <article
                  key={orderId}
                  className="shop-reveal overflow-hidden rounded-3xl border border-white bg-white shadow-lg shadow-sky-100/50 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-100/70"
                  style={{ animationDelay: `${Math.min(index * 80, 480)}ms` }}
                >
                  <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-pink-50/80 to-sky-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Order ID
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-bold text-slate-700">
                        #{orderId}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <CalendarDays size={14} className="text-sky-500" />
                        {orderDate}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(status)}`}
                      >
                        <Clock3 size={14} />
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:px-6 sm:py-5">
                    <div className="space-y-3">
                      {products.length > 0 ? (
                        products.map((item, itemIndex) => {
                          const product =
                            typeof item.productId === "object"
                              ? item.productId
                              : null;
                          const productName =
                            product?.productName || "Gift item";
                          const quantity = Number(item.quantity || 1);

                          return (
                            <div
                              key={product?._id || item.productId || itemIndex}
                              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition duration-300 hover:border-pink-100 hover:bg-white"
                            >
                              {product?.ProductImage ||
                              product?.productImage ? (
                                <img
                                  src={
                                    product.ProductImage ||
                                    product.productImage
                                  }
                                  alt=""
                                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 text-pink-500">
                                  <Gift size={20} />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-700">
                                  {productName}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  Quantity: {quantity}
                                </p>
                              </div>
                              {product?.productPrice != null && (
                                <p className="shrink-0 text-sm font-semibold text-slate-600">
                                  {formatPrice(
                                    Number(product.productPrice) * quantity
                                  )}
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-500">
                          Product details are unavailable.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-slate-200 pt-4">
                      <span className="text-sm font-semibold text-slate-500">
                        Order total
                      </span>
                      <span className="text-xl font-black text-pink-600">
                        {formatPrice(orderTotal)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
