import {
  Gift,
  Heart,
  Store,
  ShoppingBag,
  Package,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  MoveUp,
  Sparkles,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Shops", href: "/shop-listing" },
    { name: "Browse Gifts", href: "/products" },
    { name: "My Cart", href: "/cart" },
  ];

  const giftCategories = [
    "Birthday Gifts",
    "Anniversary Gifts",
    "Personalized Gifts",
    "Gift Hampers",
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-12 overflow-hidden border-t border-pink-100 bg-gradient-to-br from-white via-pink-50 to-sky-50">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -left-20 top-10 h-48 w-48 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />

      {/* Floating Decorations */}
      <div className="pointer-events-none absolute left-[8%] top-10 hidden animate-bounce text-pink-300/70 md:block">
        <Gift size={28} />
      </div>

      <div className="pointer-events-none absolute right-[10%] top-20 hidden animate-pulse text-sky-400/70 md:block">
        <Sparkles size={25} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-8 lg:px-10">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand Section */}
          <div>
            <a
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="Gift Shop Hub home"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-sky-400 text-white shadow-lg shadow-pink-200 transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <Gift size={26} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                  Gift Shop
                  <span className="text-pink-500"> Hub</span>
                </h2>
                <p className="text-xs font-medium tracking-widest text-sky-600">
                  GIFTS WITH LOVE
                </p>
              </div>
            </a>

            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-600">
              Discover beautiful gifts from local shops and make every
              special moment unforgettable.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-4 py-2 text-xs font-semibold text-pink-600 shadow-sm">
              <Heart size={14} className="animate-pulse fill-pink-500" />
              Made for every special moment
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-800">
              <Store size={19} className="text-pink-500" />
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-slate-600 transition duration-300 hover:translate-x-1 hover:text-pink-600"
                  >
                    <ArrowUpRight
                      size={15}
                      className="text-sky-500 transition-transform group-hover:rotate-45"
                    />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Gift Categories */}
          <div>
            <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-800">
              <ShoppingBag size={19} className="text-sky-500" />
              Gift Collections
            </h3>

            <ul className="space-y-3">
              {giftCategories.map((category) => (
                <li
                  key={category}
                  className="group flex items-center gap-2 text-sm text-slate-600 transition duration-300 hover:translate-x-1 hover:text-sky-600"
                >
                  <Gift
                    size={15}
                    className="shrink-0 text-pink-400 transition-transform duration-300 group-hover:rotate-12"
                  />
                  {category}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-800">
              <Package size={19} className="text-pink-500" />
              Get in Touch
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600 transition duration-300 hover:scale-110">
                  <MapPin size={17} />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Our Platform</p>
                  <p className="mt-1 text-xs leading-5">
                    Discover gift shops near you
                  </p>
                </div>
              </div>

              <a
                href="mailto:support@giftshophub.com"
                className="group flex items-center gap-3 text-sm text-slate-600 transition hover:text-pink-600"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition duration-300 group-hover:scale-110 group-hover:bg-pink-100 group-hover:text-pink-600">
                  <Mail size={17} />
                </span>
                <span className="break-all">support@giftshophub.com</span>
              </a>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <Phone size={17} />
                </span>
                <span>Contact your selected shop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Back to Top */}
        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-pink-200/70 pt-6 sm:flex-row">

          <div className="flex items-center gap-3">
            <span className="mr-1 text-sm font-semibold text-slate-700">
              Follow us
            </span>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-white text-pink-500 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-200"
            >
              <FaInstagram size={19} />
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-600 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-sky-500 hover:text-white hover:shadow-lg hover:shadow-sky-200"
            >
              <FaFacebookF size={19} />
            </a>

            <a
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-white text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:text-white"
            >
              <FaXTwitter size={18} />
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:text-pink-600 hover:shadow-md"
          >
            Back to top
            <MoveUp
              size={17}
              className="transition-transform duration-300 group-hover:-translate-y-1"
            />
          </button>
        </div>

        {/* Copyright */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-sky-100 pt-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>
            © {currentYear} Gift Shop Hub. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            Crafted with
            <Heart size={13} className="fill-pink-500 text-pink-500" />
            for every special moment.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
