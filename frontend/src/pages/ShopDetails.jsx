import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AtSign,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
} from "lucide-react";
import { RiGift2Line } from "react-icons/ri";
import Navbar from "../components/Navbar";
import {
  getShopDetails,
  getShopProducts,
} from "../services/shopDetailsService";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const resolveImage = (image) => {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image)
    ? image
    : `/${image.replace(/\\/g, "/").replace(/^\/+/, "")}`;
};

const getStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "active") return "Open";
  if (normalized === "pending") return "Pending approval";
  return normalized ? normalized[0].toUpperCase() + normalized.slice(1) : "Not provided";
};

function DetailCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/60 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
          <Icon size={18} />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ShopDetails() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const [shopData, productData] = await Promise.all([
          getShopDetails(shopId),
          getShopProducts(shopId),
        ]);
        if (!active) return;
        setShop(shopData);
        setProducts(productData);
      } catch (requestError) {
        console.error("Failed to load shop details:", requestError);
        if (active) {
          setError(requestError.message || "Unable to load shop details.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      active = false;
    };
  }, [shopId]);

  return (
    <div className="min-h-screen w-full min-w-0 bg-gradient-to-br from-sky-50 via-white to-pink-50 lg:ml-[270px] lg:w-[calc(100%-270px)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:py-7">
        <Link
          to="/shop-listing"
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 hover:text-pink-600"
        >
          <ArrowLeft size={17} />
          Back to shops
        </Link>

        {loading ? (
          <div className="rounded-3xl border border-sky-100 bg-white py-14 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-sky-500" />
            <p className="mt-3 font-medium text-sky-700">
              Loading shop details...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-pink-200 bg-white px-5 py-9 text-center shadow-sm">
            <h1 className="text-xl font-extrabold text-slate-800">
              Could not load this shop
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{error}</p>
            <Link
              to="/shop-listing"
              className="mt-4 inline-flex rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-600"
            >
              Return to shop listing
            </Link>
          </div>
        ) : shop ? (
          <>
            <section className="shop-reveal relative overflow-hidden rounded-[1.75rem] border border-white bg-gradient-to-r from-pink-500 via-rose-400 to-sky-500 p-4 text-white shadow-xl shadow-pink-100 sm:p-6 lg:p-7">
              <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
              <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <Store size={14} />
                    Shop Profile
                  </span>
                  <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {shop.shopName || "Gift Shop"}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                    <MapPin size={16} />
                    {shop.shopLocation || "Location not provided"}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-700">
                    {getStatus(shop.shopStatus)}
                  </span>
                </div>
                <div className="h-40 overflow-hidden rounded-2xl border border-white/30 bg-white/15 shadow-lg sm:h-32">
                  {shop.shopImage ? (
                    <img
                      src={resolveImage(shop.shopImage)}
                      alt={shop.shopName || "Shop"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/90">
                      <RiGift2Line size={52} />
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DetailCard title="Shop Information" icon={Store}>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {shop.shopDescription || "No shop description is available."}
                </p>
              </DetailCard>

              <DetailCard title="Location and Full Address" icon={MapPin}>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-400">Location</dt>
                    <dd className="mt-1 text-slate-700">
                      {shop.shopLocation || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-400">Full address</dt>
                    <dd className="mt-1 whitespace-pre-line leading-6 text-slate-700">
                      {shop.shopAddress || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </DetailCard>

              <DetailCard title="Contact Details" icon={Phone}>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-3 text-slate-700">
                    <Phone size={17} className="shrink-0 text-sky-500" />
                    {shop.shopContact ? (
                      <a
                        href={`tel:${shop.shopContact}`}
                        className="font-semibold hover:text-pink-600"
                      >
                        {shop.shopContact}
                      </a>
                    ) : (
                      "Phone number not provided"
                    )}
                  </p>
                  <p className="flex items-center gap-3 text-slate-700">
                    <AtSign size={17} className="shrink-0 text-pink-500" />
                    {shop.shopEmail ? (
                      <a
                        href={`mailto:${shop.shopEmail}`}
                        className="break-all font-semibold hover:text-pink-600"
                      >
                        {shop.shopEmail}
                      </a>
                    ) : (
                      "Email not provided"
                    )}
                  </p>
                </div>
              </DetailCard>

              <section className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100/60 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <ShoppingBag size={18} />
                    </span>
                    Shop-wise Products
                  </h2>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">
                    {products.length} {products.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </section>
            </div>

            <section aria-label="Shop-wise Products" className="mt-3">
              {products.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-sky-200 bg-white px-5 py-9 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                    <ShoppingBag size={22} />
                  </div>
                  <h3 className="mt-3 font-bold text-slate-800">
                    No products listed yet
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Check back soon for gifts from this shop.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <article
                      key={product._id}
                      className="shop-card-reveal group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg"
                    >
                      <div className="h-40 overflow-hidden bg-gradient-to-br from-sky-50 to-pink-50">
                        {product.ProductImage ? (
                          <img
                            src={resolveImage(product.ProductImage)}
                            alt={product.productName || "Gift"}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-pink-300">
                            <RiGift2Line size={40} />
                          </div>
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="text-xs font-semibold text-sky-600">
                          {product.productCategory || "Gift"}
                        </p>
                        <h3 className="mt-1 truncate font-extrabold text-slate-800">
                          {product.productName || "Lovely Gift"}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                          {product.productDescription ||
                            "A thoughtful gift for someone special."}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-slate-100 pt-2.5">
                          <span className="text-lg font-black text-pink-600">
                            {formatPrice(product.productPrice)}
                          </span>
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {Number(product.productStock ?? 0) > 0
                              ? `${product.productStock} in stock`
                              : "Out of stock"}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
