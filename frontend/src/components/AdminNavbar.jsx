import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { RiGift2Line } from "react-icons/ri";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { name: "Shop Management", path: "/admin/shops", icon: Store },
  { name: "Product Management", path: "/admin/products", icon: Package },
  { name: "User Management", path: "/admin/users", icon: Users },
  { name: "Order Management", path: "/admin/orders", icon: ShoppingBag },
];

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.innerWidth >= 1024
  );

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      if (desktop) setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMenu = () => {
    if (!isDesktop) setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close admin menu" : "Open admin menu"}
        aria-expanded={isOpen}
        aria-controls="admin-sidebar"
        className={`fixed left-4 top-4 flex h-11 w-11 items-center
          justify-center rounded-2xl border border-sky-100 bg-white
          text-gray-700 shadow-lg shadow-sky-100/70 transition-all duration-300
          hover:bg-pink-50 hover:text-pink-600 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-pink-400
          lg:hidden ${
            isOpen ? "z-[50] rotate-90" : "z-[80] rotate-0"
          }`}
      >
        {isOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={closeMenu}
          className="fixed inset-0 z-[55] cursor-default bg-slate-950/40
            backdrop-blur-[2px] animate-in fade-in duration-200"
        />
      )}

      {/* Admin sidebar */}
      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        aria-hidden={!isDesktop && !isOpen}
        className={`fixed inset-y-0 left-0 z-[60] flex h-[100dvh]
          w-[270px] max-w-[85vw] flex-col overflow-hidden
          border-r border-gray-100 bg-white px-4 py-6
          shadow-xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:shadow-none
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
      >
        {/* Brand */}
        <NavLink
          to="/"
          onClick={closeMenu}
          tabIndex={isDesktop || isOpen ? 0 : -1}
          className="mb-10 flex shrink-0 items-center gap-3 px-2 pt-2
            text-gray-900"
        >
          <span className="flex h-11 w-11 shrink-0 items-center
            justify-center rounded-xl bg-gradient-to-br from-pink-500
            to-rose-400 text-white shadow-md shadow-pink-200
            transition-transform duration-300 hover:rotate-[-8deg] hover:scale-105">
            <RiGift2Line size={27} />
          </span>

          <span>
            <strong className="block text-xl font-extrabold tracking-tight">
              Giftify<span className="text-pink-500">.</span>
            </strong>
            <small className="mt-0.5 block text-[10px] font-semibold
              tracking-[1.5px] text-gray-400">
              ADMIN PANEL
            </small>
          </span>
        </NavLink>

        {/* Menu heading */}
        <p className="mb-3 shrink-0 px-3 text-[11px] font-bold
          uppercase tracking-[1.8px] text-gray-400">
          Management
        </p>

        {/* Navigation links */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeMenu}
                tabIndex={isDesktop || isOpen ? 0 : -1}
                className={({ isActive }) =>
                  `group flex min-h-[48px] w-full items-center gap-3
                  rounded-xl px-3 py-2 transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-pink-300 ${
                    isActive
                      ? "bg-pink-50 font-semibold text-pink-600"
                      : "font-medium text-gray-500 hover:translate-x-1 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center
                        justify-center rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-pink-500 text-white shadow-sm shadow-pink-200"
                            : "bg-gray-50 text-gray-500 group-hover:bg-sky-50 group-hover:text-sky-500"
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
                        className="shrink-0 animate-in slide-in-from-left-1
                          text-pink-500 duration-200"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile and logout */}
        <div className="shrink-0 border-t border-gray-100 pt-4">
          <div className="flex min-w-0 items-center gap-3 px-1 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center
              justify-center overflow-hidden rounded-full bg-blue-100
              text-base font-bold text-blue-600">
              {user?.name?.charAt(0)?.toUpperCase() || (
                <UserRound size={20} />
              )}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <strong className="truncate text-xs text-gray-800">
                {user?.name || "Administrator"}
              </strong>
              <small className="truncate text-[10px] text-gray-400">
                {user?.email || "Admin account"}
              </small>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            tabIndex={isDesktop || isOpen ? 0 : -1}
            className="group flex w-full items-center gap-3 rounded-xl
              px-3 py-3 text-gray-500 transition-all duration-200
              hover:bg-red-50 hover:text-red-500
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-red-300"
          >
            <span className="flex h-9 w-9 items-center justify-center
              rounded-lg bg-gray-50 transition-colors group-hover:bg-red-100">
              <LogOut size={19} />
            </span>
            <span className="flex-1 text-left text-[13px] font-semibold">
              Logout
            </span>
          </button>

          <p className="mt-4 text-center text-[10px] text-gray-400">
            Giftify © 2026
          </p>
        </div>
      </aside>
    </>
  );
}
