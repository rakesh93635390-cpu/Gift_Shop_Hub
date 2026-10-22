import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Heart,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  SlidersHorizontal,
  X,
  ShoppingCart,
} from "lucide-react";
import Swal from "sweetalert2";

import Navbar from "../components/Navbar";
import fetchProducts from "../services/productService";
import { addProductToCart } from "../services/cartService";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    let active = true;

    fetchProducts()
      .then((data) => {
        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load products");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products.map((p) => p.productCategory).filter(Boolean)
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesCategory =
        category === "All" || p.productCategory === category;

      const text = [
        p.productName,
        p.productDescription,
        p.productCategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && text.includes(search.toLowerCase().trim());
    });

    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => (a.productPrice || 0) - (b.productPrice || 0)
      );
    } else if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => (b.productPrice || 0) - (a.productPrice || 0)
      );
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        (a.productName || "").localeCompare(b.productName || "")
      );
    }

    return result;
  }, [products, category, search, sortBy]);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleAddToCart = async (product) => {
    try {
      await addProductToCart(product);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${product.productName || "Gift"} added to your cart`,
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Couldn't add this gift",
        text: err.message || "Please try again.",
        confirmButtonColor: "#ec4899",
      });
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-linear-to-br from-sky-50 via-white to-pink-50 lg:ml-[270px] lg:w-[calc(100%-270px)]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-16 sm:px-6 sm:pb-6 sm:pt-16 lg:px-8 lg:py-6">
        {/* Customer welcome banner */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-pink-500 via-pink-200 to-sky-500 px-5 py-8 text-white shadow-xl sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/20 blur-2xl" />

          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs backdrop-blur sm:text-sm">
              <Sparkles size={15} /> Gifts made with love
            </span>

            <h1 className="mt-3 text-2xl font-extrabold sm:text-4xl">
              Find Your Perfect Gift 🎁
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-white/90 sm:text-base">
              Discover beautiful gifts from local shops for every
              special moment.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-sky-600 transition hover:-translate-y-1 hover:bg-pink-50"
            >
              Explore Gifts
            </button>
          </div>
        </section>

        {/* Product heading */}
        <section id="products" className="scroll-mt-6 pt-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-pink-500">
                Made for you
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
                Our Products
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Find something special for someone special.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-white px-3 py-2 text-pink-600 shadow-sm transition hover:border-pink-300">
                <Heart size={18} className="fill-pink-500 text-pink-500" />
                <span className="font-semibold">{wishlist.length}</span>
              </div>
            </div>
          </div>

          {/* Search, sort and category */}
          <div className="mt-4 rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Filter panel
              </p>
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
              >
                <SlidersHorizontal size={15} />
                {showFilters ? "Hide filters" : "Show filters"}
              </button>
            </div>

            {showFilters && (
              <div className="mt-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px_160px]">
                  <div                   className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
                    <Search size={20} className="text-sky-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search gifts..."
                      aria-label="Search gifts"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        className="text-slate-400 hover:text-pink-500"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Choose product category"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item === "All" ? "All Categories" : item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition duration-200 ${
                        category === item
                          ? "bg-linear-to-r from-sky-500 to-pink-500 text-white shadow-md"
                          : "bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                      }`}
                    >
                      {item === "All" ? "All" : item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-14 text-sky-600">
              <LoaderCircle size={34} className="animate-spin" />
              <p className="mt-2 font-medium">Finding lovely gifts...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="font-semibold text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm text-white"
              >
                <RefreshCw size={17} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="my-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"} found
                </p>
                {(search || category !== "All" || sortBy !== "default") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                      setSortBy("default");
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-pink-500"
                  >
                    <SlidersHorizontal size={15} /> Clear all filters
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-8 text-center">
                  <Search size={32} className="mx-auto text-pink-400" />
                  <h3 className="mt-3 text-lg font-bold text-slate-800">
                    No gifts found
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Try another name or category.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                    }}
                    className="mt-3 text-sm font-semibold text-sky-600 hover:text-pink-500"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const owner = product.productOwner;
                    const shop = product.productShop;
                    const ownerName =
                      owner && typeof owner === "object"
                        ? owner.name ||
                          owner.username ||
                          owner.fullName ||
                          "Gift Creator"
                        : "Gift Creator";
                    const shopName =
                      shop && typeof shop === "object"
                        ? shop.shopName || shop.name || "Gift Shop"
                        : "Gift Shop";
                    const wished = wishlist.includes(product._id);

                    return (
                      <article
                        key={product._id}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-sky-100"
                      >
                        <div className="relative overflow-hidden bg-sky-50">
                          <img
                            src={product.ProductImage}
                            alt={product.productName || "Gift"}
                            loading="lazy"
                            className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-48"
                          />
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-sky-700 shadow">
                            {product.productCategory || "Gift"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product._id)}
                            aria-label={
                              wished ? "Remove wishlist" : "Add wishlist"
                            }
                            aria-pressed={wished}
                            className={`absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full shadow transition hover:scale-110 ${
                              wished
                                ? "bg-pink-500 text-white"
                                : "bg-white text-pink-500 hover:bg-pink-500 hover:text-white"
                            }`}
                          >
                            <Heart
                              size={18}
                              fill={wished ? "currentColor" : "none"}
                            />
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="line-clamp-1 text-lg font-extrabold text-slate-800">
                            {product.productName || "Lovely Gift"}
                          </h3>
                          <p className="mt-1.5 line-clamp-3 min-h-12 text-sm leading-5 text-slate-500">
                            {product.productDescription ||
                              "A thoughtful gift for your loved ones."}
                          </p>
                          <div className="my-3 space-y-2 border-y border-dashed border-slate-200 py-3 text-sm">
                            <p className="font-semibold text-slate-700">
                              <span className="text-xs text-slate-400">
                                Product Owner
                              </span>
                              <br />
                              {ownerName}
                            </p>
                            <p className="font-semibold text-slate-700">
                              <span className="text-xs text-slate-400">
                                Product Shop
                              </span>
                              <br />
                              {shopName}
                            </p>
                          </div>
                          <div className="mt-auto">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xl font-extrabold text-pink-600">
                                ₹
                                {Number(
                                  product.productPrice || 0
                                ).toLocaleString("en-IN")}
                              </p>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                {Number(product.productStock ?? 0) <= 0
                                  ? "Out of stock"
                                  : `${Number(product.productStock)} available`}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={Number(product.productStock ?? 0) <= 0}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 px-3 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                            >
                              <ShoppingCart size={17} />
                              {Number(product.productStock ?? 0) <= 0
                                ? "Out of stock"
                                : "Add to cart"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
