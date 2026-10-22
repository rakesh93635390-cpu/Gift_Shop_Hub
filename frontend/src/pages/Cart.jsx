import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { RiGift2Line, RiHeart3Line } from "react-icons/ri";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import { getCart, saveCart } from "../services/cartService";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let active = true;
    getCart()
      .then((savedCart) => {
        if (active) setCart(savedCart);
      })
      .catch((error) => {
        console.error("Failed to load cart:", error);
        if (active) {
          setCartError(error.message || "Unable to load your saved cart.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.productPrice || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );
  const itemCount = useMemo(
    () => cart.reduce((count, item) => count + Number(item.quantity || 0), 0),
    [cart]
  );

  const updateCart = async (nextCart) => {
    try {
      const savedCart = await saveCart(nextCart);
      setCart(savedCart);
      setCartError("");
    } catch (error) {
      console.error("Failed to update cart:", error);
      Swal.fire({
        icon: "error",
        title: "Cart not updated",
        text: "We couldn't save this change. Please try again.",
        confirmButtonColor: "#ec4899",
      });
    }
  };

  const changeQuantity = (productId, change) => {
    const nextCart = cart.map((item) => {
      if (item.productId !== productId) return item;
      const maximum = Number(item.stock);
      const nextQuantity = item.quantity + change;

      if (nextQuantity < 1) return item;
      if (Number.isFinite(maximum) && maximum > 0 && nextQuantity > maximum) {
        return item;
      }
      return { ...item, quantity: nextQuantity };
    });
    updateCart(nextCart);
  };

  const removeItem = async (item) => {
    const result = await Swal.fire({
      title: "Remove this lovely gift?",
      text: `${item.productName} will be removed from your cart.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Remove gift",
      cancelButtonText: "Keep it",
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#38bdf8",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      updateCart(cart.filter((entry) => entry.productId !== item.productId));
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-gradient-to-br from-sky-50 via-white to-pink-50 lg:ml-[270px] lg:w-[calc(100%-270px)]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:py-7">
        <header className="shop-reveal relative mb-6 overflow-hidden rounded-[1.75rem] border border-white bg-gradient-to-r from-pink-500 via-rose-400 to-sky-500 px-5 py-6 text-white shadow-xl shadow-pink-100 sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-8 -top-14 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm">
              <Sparkles size={15} />
              A little joy, all in one place
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
              Your gift cart
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-white/90 sm:text-base">
              Thoughtful finds are just a few steps away. Take a look at your
              hand-picked favourites.
            </p>
          </div>
          <RiGift2Line
            aria-hidden="true"
            className="absolute bottom-4 right-6 hidden rotate-12 text-white/25 sm:block"
            size={88}
          />
        </header>

        {cartError ? (
          <section className="rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <ShoppingBag size={26} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-800">
              We couldn’t open your cart
            </h2>
            <p className="mt-2 text-sm text-slate-500">{cartError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pink-600"
            >
              Try again
            </button>
          </section>
        ) : cart.length === 0 ? (
          <section className="shop-reveal relative overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white px-5 py-8 text-center shadow-lg shadow-sky-100/60 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-pink-100/70 blur-2xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-sky-100/80 blur-2xl" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-pink-100 to-sky-100 text-pink-500 shadow-inner">
              <Gift size={36} strokeWidth={1.7} />
              <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sky-500 shadow-md">
                <RiHeart3Line size={18} />
              </span>
            </div>
            <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.22em] text-pink-500">
              Your next favourite is waiting
            </p>
            <h2 className="relative mt-1.5 text-xl font-black text-slate-800 sm:text-2xl">
              Your cart is feeling lonely
            </h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm leading-5 text-slate-500 sm:text-base">
              Fill it with something lovely. Browse our collection and find a
              thoughtful gift for someone special.
            </p>
            <Link
              to="/products"
              className="relative mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-200"
            >
              <RiGift2Line size={19} />
              Find a lovely gift
              <ArrowRight size={17} />
            </Link>
            <div className="relative mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Heart size={14} className="text-pink-400" /> Picked with love
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-400" /> Local treasures
              </span>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                  Saved for someone special
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-800">
                  Shopping bag
                  <span className="ml-2 align-middle text-base font-semibold text-slate-400">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                </h2>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 hover:text-pink-600"
              >
                <ArrowLeft size={16} />
                Keep browsing
              </Link>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section
                aria-label="Cart items"
                className="space-y-3"
              >
                {cart.map((item, index) => (
                  <article
                    key={item.productId}
                    className="shop-card-reveal group rounded-2xl border border-sky-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/60 sm:p-3.5"
                    style={{ animationDelay: `${Math.min(index, 7) * 70}ms` }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative h-40 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-pink-50 sm:h-28 sm:w-32">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-pink-300">
                            <Gift size={34} strokeWidth={1.5} />
                          </div>
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-sky-700 shadow-sm backdrop-blur">
                          {item.productCategory || "Gift"}
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:min-h-24 sm:flex-row sm:items-center">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-pink-500">
                            {item.shopName || "Gift Shop"}
                          </p>
                          <h3 className="mt-1 truncate text-base font-extrabold text-slate-800">
                            {item.productName || "Lovely Gift"}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-sky-700 sm:mt-2">
                            {formatPrice(item.productPrice)}
                            <span className="ml-1 font-normal text-slate-400">
                              each
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div
                            className="inline-flex h-10 items-center rounded-xl border border-sky-100 bg-sky-50/70 p-1"
                            aria-label={`Quantity for ${item.productName}`}
                          >
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.productId, -1)}
                              disabled={item.quantity <= 1}
                              aria-label={`Decrease ${item.productName} quantity`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-700 transition hover:bg-white hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={15} />
                            </button>
                            <span className="min-w-8 text-center text-sm font-bold text-slate-700">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.productId, 1)}
                              disabled={
                                Number(item.stock) > 0 &&
                                item.quantity >= Number(item.stock)
                              }
                              aria-label={`Increase ${item.productName} quantity`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-700 transition hover:bg-white hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                          <div className="min-w-20 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Total
                            </p>
                            <p className="mt-1 font-extrabold text-slate-800">
                              {formatPrice(
                                Number(item.productPrice || 0) *
                                  Number(item.quantity || 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end border-t border-dashed border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="lg:sticky lg:top-8">
                <section className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-lg shadow-pink-100/60">
                  <div className="bg-gradient-to-r from-pink-50 to-sky-50 px-4 py-3">
                    <h2 className="flex items-center gap-2 font-extrabold text-slate-800">
                      <ShoppingBag size={18} className="text-pink-500" />
                      Order summary
                    </h2>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Truck size={15} className="text-sky-500" />
                        Delivery
                      </span>
                      <span className="font-semibold text-emerald-600">
                        Calculated at checkout
                      </span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-3">
                      <div className="flex items-end justify-between gap-3">
                        <span className="font-bold text-slate-700">Total</span>
                        <span className="text-xl font-black text-pink-600">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <p className="mt-1 text-right text-xs text-slate-400">
                        Delivery not included
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-200"
                    >
                      Continue to checkout
                      <ArrowRight size={17} />
                    </button>
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                      <ShieldCheck size={14} className="text-sky-500" />
                      Your cart is saved on this device
                    </p>
                  </div>
                </section>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-sky-100 bg-white/80 p-2.5 text-center">
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                      <Check size={15} />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-slate-600">
                      Lovely local finds
                    </p>
                  </div>
                  <div className="rounded-2xl border border-pink-100 bg-white/80 p-2.5 text-center">
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                      <Heart size={14} />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-slate-600">
                      Gifts picked with care
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
