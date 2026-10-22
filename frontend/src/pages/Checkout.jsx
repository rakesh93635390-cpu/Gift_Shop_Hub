import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gift,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import { getCart } from "../services/cartService";
import { placeOrder } from "../services/checkoutService";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [cartError, setCartError] = useState("");
  const [address, setAddress] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return { ...EMPTY_ADDRESS, name: user?.name || "" };
    } catch {
      return EMPTY_ADDRESS;
    }
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddressChange = (event) => {
    setAddress((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || cart.length === 0) return;

    setSubmitting(true);
    try {
      await placeOrder(address, cart);
      setCart([]);
      await Swal.fire({
        icon: "success",
        title: "Order placed!",
        text: "Your thoughtful gifts are on their way.",
        confirmButtonText: "Continue shopping",
        confirmButtonColor: "#ec4899",
      });
      navigate("/products");
    } catch (error) {
      console.error("Checkout failed:", error);
      await Swal.fire({
        icon: "error",
        title: "We couldn't place your order",
        text:
          error.response?.data?.message ||
          error.message ||
          "Please try again in a moment.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

  return (
    <div className="min-h-screen w-full min-w-0 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-pink-50 lg:ml-[270px] lg:w-[calc(100%-270px)]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:py-8">
        <header className="relative mb-7 overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-pink-500 via-rose-400 to-sky-500 px-5 py-7 text-white shadow-xl shadow-pink-200/60 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 animate-pulse rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 animate-pulse rounded-full bg-sky-200/30 blur-3xl [animation-delay:800ms]" />
          <div className="relative z-10 max-w-2xl">
            <Link
              to="/cart"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition duration-300 hover:-translate-x-1 hover:bg-white/25"
            >
              <ArrowLeft size={15} />
              Back to cart
            </Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <Sparkles size={16} className="animate-pulse" />
              Almost there — your gifts are waiting
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Delivery details
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              Add your delivery address and we’ll take care of the rest.
            </p>
          </div>
          <Gift
            aria-hidden="true"
            className="absolute bottom-4 right-6 hidden animate-bounce text-white/30 [animation-duration:4s] sm:block"
            size={78}
          />
        </header>

        {cartError ? (
          <section className="rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-sm">
            <p className="font-semibold text-slate-700">
              We couldn’t open your cart
            </p>
            <p className="mt-2 text-sm text-slate-500">{cartError}</p>
            <Link
              to="/cart"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
            >
              Return to cart <ArrowRight size={16} />
            </Link>
          </section>
        ) : cart.length === 0 ? (
          <section className="rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-lg shadow-sky-100/50">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-sky-100 text-pink-500">
              <Gift size={30} />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-slate-800">
              Your cart is waiting for a little joy
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add a gift before continuing to checkout.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
            >
              Explore gifts <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)]">
            <section className="shop-reveal rounded-3xl border border-white bg-white/95 p-5 shadow-xl shadow-sky-100/60 sm:p-8">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <MapPin size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">
                    Where should we deliver?
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Please enter your delivery contact and address.
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="delivery-name"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>
                  <input
                    id="delivery-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    required
                    value={address.name}
                    onChange={handleAddressChange}
                    placeholder="Name of the person receiving the order"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="delivery-phone"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Phone number
                  </label>
                  <input
                    id="delivery-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    required
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="A number the courier can reach"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="delivery-address"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Street address
                  </label>
                  <textarea
                    id="delivery-address"
                    name="address"
                    autoComplete="street-address"
                    rows={3}
                    maxLength={300}
                    required
                    value={address.address}
                    onChange={handleAddressChange}
                    placeholder="House number, street, area, or landmark"
                    className={`${inputClassName} resize-y`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="delivery-city"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      City
                    </label>
                    <input
                      id="delivery-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      maxLength={100}
                      required
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="Your city"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="delivery-pincode"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      PIN code
                    </label>
                    <input
                      id="delivery-pincode"
                      name="pincode"
                      type="text"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={12}
                      required
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="Postal code"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-sky-500 px-5 py-3 font-bold text-white shadow-lg shadow-pink-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-200/70 focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Placing your order...
                    </>
                  ) : (
                    <>
                      <PackageCheck size={19} />
                      Place order
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>
            </section>

            <aside className="shop-reveal h-fit overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-xl shadow-pink-100/60 [animation-delay:150ms] lg:sticky lg:top-8">
              <div className="bg-gradient-to-r from-pink-50 to-sky-50 px-5 py-4">
                <h2 className="flex items-center gap-2 font-extrabold text-slate-800">
                  <Gift size={18} className="text-pink-500" />
                  Your gifts
                </h2>
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto p-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition duration-300 hover:border-sky-100 hover:bg-white"
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 text-pink-500">
                        <Gift size={22} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-700">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-extrabold text-slate-700">
                      {formatPrice(
                        Number(item.productPrice || 0) *
                          Number(item.quantity || 0)
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-dashed border-slate-200 p-5">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Items</span>
                  <span>
                    {cart.reduce(
                      (count, item) => count + Number(item.quantity || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck size={15} className="text-sky-500" />
                    Delivery
                  </span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="text-2xl font-black text-pink-600">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
                  <ShieldCheck size={14} className="text-sky-500" />
                  Secure order placement
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
