import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import getShops from "../services/shopService";

const locations = [
  "All Locations",
  "Salem",
  "Tirupattur",
  "Chennai",
  "Vellore",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Erode",
];

const normalizeShopStatus = (value) => {
  const status = String(value == null ? "" : value).trim().toLowerCase();

  if (["active"].includes(status)) {
    return "Open";
  }

  if (["pending"].includes(status)) {
    return "Closed";
  }

  return "Closed";
};

export default function ShopListing() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch shops from backend
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError("");

        const shopsData = await getShops();

        const formattedShops = shopsData.map((shop) => {
          const rawImage = shop.shopImage || shop.image || "";
          const shopName = shop.shopName || shop.name || "Gift Shop";
          const rawDescription =
            typeof shop.shopDescription === "string"
              ? shop.shopDescription.trim()
              : "";

          const image = /^(https?:|data:|blob:)/i.test(rawImage)
            ? rawImage
            : rawImage
              ? `/${rawImage.replace(/\\/g, "/").replace(/^\/+/, "")}`
              : "";

          const normalizedShopStatus = normalizeShopStatus(
            shop.shopStatus || shop.status
          );

          return {
            id: shop._id || shop.id,
            name: shopName,
            location:
              shop.shopLocation ||
              shop.shopAddress ||
              shop.location ||
              "Location not available",
            status: normalizedShopStatus,
            image,
            rating: shop.rating ?? null,
            reviews: shop.reviews ?? null,
            category: shop.category || "",
            description:
              rawDescription ||
              "Discover unique gifts, curated local finds, and thoughtful surprises for every occasion.",
          };
        });

        setShops(formattedShops);
      } catch (err) {
        console.error("Failed to fetch shops:", err);
        setError(err.message || "Unable to load shops.");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Search and filter logic
  const filteredShops = shops.filter((shop) => {
    const searchTerm = search.trim().toLowerCase();
    const searchableText =
      (shop.name || "") +
      " " +
      (shop.description || "") +
      " " +
      (shop.category || "") +
      " " +
      (shop.location || "");
    const matchesSearch =
      !searchTerm || searchableText.toLowerCase().includes(searchTerm);

    const normalizedShopLocation = (shop.location || "")
      .toLowerCase()
      .replace("tirupatture", "tirupattur");

    const matchesLocation =
      location === "All Locations" ||
      normalizedShopLocation.includes(location.toLowerCase());

    const matchesStatus = status === "All" || shop.status === status;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  return (
    <div className="min-h-screen w-full min-w-0 bg-white lg:ml-[270px] lg:w-[calc(100%-270px)]">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-sky-100 bg-gradient-to-br from-pink-50 via-white to-sky-50">
        <div className="mx-auto max-w-7xl px-4 pb-9 pt-20 sm:px-6 sm:pb-12 lg:px-8 lg:py-14">
          <div className="shop-reveal mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 shadow-sm sm:text-sm">
            <span>📍</span>
            Explore Local Shops
          </div>

          <h1 className="shop-reveal max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-sky-500 sm:text-4xl lg:text-5xl" style={{ animationDelay: "80ms" }}>
            Discover{" "}
            <span className="text-pink-500">
              Amazing Gift Shops
            </span>
          </h1>

          <p className="shop-reveal mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 lg:text-lg" style={{ animationDelay: "150ms" }}>
            Find the best gift shops near you with great collections
            and amazing offers.
          </p>

          {/* Search & Filters */}
          <div className="shop-reveal mt-7 rounded-2xl border border-sky-100 bg-white p-3 shadow-lg shadow-sky-100/70 sm:mt-8 sm:rounded-3xl sm:p-4" style={{ animationDelay: "220ms" }}>
            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">

              {/* Search */}
              <div className="flex min-w-0 items-center rounded-xl border border-sky-200 bg-sky-50/40 px-4 py-3 transition focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 sm:rounded-2xl">
                <span className="mr-3 text-xl text-sky-500">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shops by name or description..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Location */}
              <div className="flex min-w-0 items-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 transition focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 sm:rounded-2xl">
                <span className="mr-3 text-lg text-pink-500">
                  📍
                </span>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full min-w-0 cursor-pointer  text-sm font-medium text-sky-800 outline-none"
                >
                  {locations.map((item) => (
                    <option key={item} value={item} className="">
                      {item }
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full cursor-pointer rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md shadow-pink-200 outline-none transition hover:bg-pink-600 focus:ring-2 focus:ring-pink-200 sm:col-span-2 sm:rounded-2xl lg:col-span-1 lg:w-auto"
              >
                <option value="All">All Shops</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Listing */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="shop-reveal mb-6 flex flex-col justify-between gap-4 sm:mb-7 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏪</span>

              <h2 className="text-2xl font-bold text-sky-500 sm:text-3xl">
                All Shops
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Explore {filteredShops.length} gift shops near you
            </p>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-sky-500" />

            <p className="mt-4 text-sky-700">
              Loading gift shops...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-pink-200 bg-pink-50 px-6 py-10 text-center shadow-sm">
            <p className="font-semibold text-pink-700">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-pink-500 px-6 py-2 font-semibold text-white shadow-md shadow-pink-200 transition hover:bg-pink-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && filteredShops.length > 0 && (
          <div className="shop-card-grid grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {filteredShops.map((shop) => (
              <Link
                key={shop.id}
                to={`/shop/${shop.id}`}
                aria-label={`View details for ${shop.name}`}
                className="shop-card-reveal group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-md shadow-sky-100/60 transition duration-500 ease-out hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-sky-50 sm:h-52">
                  {shop.image && (
                    <img
                      src={shop.image}
                      alt={shop.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Status */}
                  <div
                    className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-bold shadow-md ${
                      shop.status === "Open"
                        ? "border-sky-200 text-sky-700"
                        : "border-pink-200 text-pink-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        shop.status === "Open"
                          ? "bg-sky-500"
                          : "bg-pink-500"
                      }`}
                    />

                    {shop.status}
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white p-4">
                  <h3 className="text-xl font-bold text-sky-500 transition-colors group-hover:text-pink-600">
                    {shop.name}
                  </h3>

                  {/* Rating - shown only when backend provides it */}
                  {shop.rating != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-yellow-400">★</span>

                      <span className="font-semibold text-slate-700">
                        {shop.rating}
                      </span>

                      {shop.reviews != null && (
                        <span className="text-sm text-slate-400">
                          ({shop.reviews} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-pink-500">📍</span>
                    {shop.location}
                  </p>

                  {/* Category */}
                  {shop.category && (
                    <span className="mt-3 inline-block rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      {shop.category}
                    </span>
                  )}

                  {shop.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {shop.description.length > 110
                        ? shop.description.slice(0, 110).trim() + "..."
                        : shop.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredShops.length === 0 && (
          <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-pink-50 px-6 py-16 text-center">
            <div className="text-5xl">🔍</div>

            <h3 className="mt-4 text-xl font-bold text-sky-900">
              No shops found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or location filter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}