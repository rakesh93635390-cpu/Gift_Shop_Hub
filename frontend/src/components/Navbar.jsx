
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  Store,
  Package,
  ShoppingCart,
  UserRound,
  LogOut,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { RiGift2Line } from "react-icons/ri";

const Navbar = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const [userRole, setUserRole] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role?.toLowerCase() || "user";
    } catch {
      return "user";
    }
  });

  const isAdmin = isAuthenticated && userRole === "admin";

  const menuItems = [
    { name: "Home", path: "/", icon: House },
    { name: "Explore Shops", path: "/shop-listing", icon: Store },
    { name: "Products", path: "/products", icon: RiGift2Line },
    { name: "My Orders", path: "/my-orders", icon: Package },
    { name: "Cart", path: "/cart", icon: ShoppingCart },
    { name: "Profile", path: "/profile", icon: UserRound },
  ];

  const closeMenu = () => {
    if (!isDesktop) setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    const syncAuthState = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("token")));

      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        setUserRole(user?.role?.toLowerCase() || "user");
      } catch {
        setUserRole("user");
      }
    };

    handleResize();
    syncAuthState();

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("authChange", syncAuthState);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("authChange", syncAuthState);
    };
  }, []);

  const handleNavClick = (event, item) => {
    closeMenu();

    if (!isAuthenticated && item.path !== "/") {
      event.preventDefault();
      navigate("/login");
    }
  };

  const handleLogout = () => {
    closeMenu();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setUserRole("user");

    window.dispatchEvent(new Event("authChange"));
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="giftify-sidebar"
        className={`fixed left-4 top-4 flex h-12 w-12 items-center
          justify-center rounded-2xl border border-sky-100 bg-white
          text-gray-700 shadow-lg shadow-sky-100/70 transition-all
          duration-300 hover:bg-pink-50 hover:text-pink-600
          lg:hidden ${isOpen ? "z-[50]" : "z-[80]"}`}
      >
        {isOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeMenu}
          className="fixed inset-0 z-[55] cursor-default
            bg-black/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="giftify-sidebar"
        aria-label="Main navigation"
        aria-hidden={!isDesktop && !isOpen}
        className={`fixed inset-y-0 left-0 z-[60] flex h-[100dvh]
          w-[270px] max-w-[85vw] flex-col overflow-hidden
          border-r border-gray-100 bg-white px-4 py-6
          shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:shadow-none`}
      >
        {/* Brand */}
        <div className="mb-8 flex shrink-0 items-center justify-between gap-2 px-2 pt-2">
          <NavLink
            to="/"
            onClick={closeMenu}
            tabIndex={isDesktop || isOpen ? 0 : -1}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center
              justify-center rounded-xl bg-gradient-to-br from-pink-500
              to-rose-400 text-white shadow-md shadow-pink-200">
              <RiGift2Line size={27} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                Giftify<span className="text-pink-500">.</span>
              </h1>
              <p className="mt-0.5 text-[10px] font-semibold
                tracking-[1.5px] text-gray-400">
                GIFT WITH LOVE
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close sidebar"
            tabIndex={isDesktop || isOpen ? 0 : -1}
            className="flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg text-gray-500 transition hover:bg-pink-50
              hover:text-pink-600 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Admin Dashboard Button - Admin Only */}
        {isAdmin && (
          <div className="mb-6">
            <p className="mb-3 px-3 text-[11px] font-bold uppercase
              tracking-[1.8px] text-gray-400">
              Administration
            </p>

            <NavLink
              to="/admin"
              end
              onClick={closeMenu}
              tabIndex={isDesktop || isOpen ? 0 : -1}
              className={({ isActive }) =>
                `group flex min-h-[48px] items-center gap-3 rounded-xl
                border px-3 py-2 transition-all duration-200
                ${
                  isActive
                    ? "border-pink-200 bg-pink-50 font-semibold text-pink-600"
                    : "border-sky-100 bg-sky-50/50 font-medium text-slate-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 items-center justify-center
                      rounded-lg transition-colors ${
                        isActive
                          ? "bg-pink-500 text-white"
                          : "bg-white text-sky-600 group-hover:bg-pink-500 group-hover:text-white"
                      }`}
                  >
                    <LayoutDashboard size={19} />
                  </span>

                  <span className="flex-1 text-[13px]">
                    Admin Dashboard
                  </span>

                  <ShieldCheck size={16} />
                </>
              )}
            </NavLink>
          </div>
        )}

        {/* Main Menu */}
        <p className="mb-3 shrink-0 px-3 text-[11px] font-bold
          uppercase tracking-[1.8px] text-gray-400">
          Main Menu
        </p>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const disabled = !isAuthenticated && item.path !== "/";

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={(event) => handleNavClick(event, item)}
                tabIndex={
                  !disabled && (isDesktop || isOpen) ? 0 : -1
                }
                className={({ isActive }) =>
                  `group flex min-h-[46px] w-full items-center gap-3
                  rounded-xl px-3 py-2 transition-all duration-200 ${
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : isActive
                        ? "bg-pink-50 font-semibold text-pink-600"
                        : "font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center
                        justify-center rounded-lg transition-colors ${
                          isActive
                            ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                            : "bg-gray-50 text-gray-500 group-hover:bg-pink-50 group-hover:text-sky-500"
                        }`}
                    >
                      <Icon size={19} strokeWidth={2} />
                    </span>

                    <span className="min-w-0 flex-1 text-[13px] leading-5">
                      {item.name}
                    </span>

                    {isActive && (
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-pink-500"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Account and Logout */}
        <div className="shrink-0 border-t border-gray-100 pt-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              tabIndex={isDesktop || isOpen ? 0 : -1}
              className="group flex w-full items-center gap-3 rounded-xl
                px-3 py-3 text-gray-500 transition-all duration-200
                hover:bg-red-50 hover:text-red-500"
            >
              <span className="flex h-9 w-9 items-center justify-center
                rounded-lg bg-gray-50 transition-colors group-hover:bg-red-100">
                <LogOut size={19} />
              </span>

              <span className="flex-1 text-left text-[13px] font-semibold">
                Logout
              </span>
            </button>
          ) : (
            <div className="space-y-2">
              <NavLink
                to="/login"
                onClick={closeMenu}
                className="flex w-full items-center justify-center
                  rounded-xl bg-pink-500 px-4 py-3 text-sm font-semibold
                  text-white transition hover:bg-pink-600"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                onClick={closeMenu}
                className="flex w-full items-center justify-center
                  rounded-xl border border-sky-200 bg-sky-50 px-4 py-3
                  text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Register
              </NavLink>
            </div>
          )}

          <p className="mt-4 text-center text-[10px] text-gray-400">
            Giftify © 2026
          </p>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
