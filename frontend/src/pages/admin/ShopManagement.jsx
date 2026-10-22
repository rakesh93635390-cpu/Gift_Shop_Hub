import { useCallback, useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import shopManagementService from "../../services/shopManagementService";

import Swal from "sweetalert2";

import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Pencil,
  Trash2,
  Eye,
  X,
  Filter,
  Package,
  Sparkles,
  Mail,
  ArrowUpRight,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  FaGift,
  FaShopify,
} from "react-icons/fa";

const emptyForm = {
  name: "",
  description: "",
  location: "",
  address: "",
  phone: "",
  email: "",
  status: "Active",
  image: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100";

export default function ShopManagement() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyShopId, setBusyShopId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [showDetails, setShowDetails] = useState(null);

  const loadShops = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const shopList = await shopManagementService.getShops();
      setShops(shopList);
    } catch (error) {
      console.error("Failed to load shops:", error);
      setLoadError(error.message || "Unable to load shops.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  // Search and filter
  const filteredShops = shops.filter((shop) => {
    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm) ||
      shop.location.toLowerCase().includes(searchTerm) ||
      shop.address.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" || shop.status === statusFilter;

    const matchesLocation =
      locationFilter === "All" ||
      shop.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const locations = [
    ...new Set(shops.map((shop) => shop.location).filter(Boolean)),
  ];

  const activeCount = shops.filter(
    (shop) => shop.status === "Active"
  ).length;

  const pendingCount = shops.filter(
    (shop) => shop.status === "Pending"
  ).length;

  // Open create form
  const handleCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (shop) => {
    setEditingId(shop.id);
    setForm({ ...shop });
    setShowForm(true);
  };

  // Form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create or update shop
  const handleSubmit = async (e) => {
    e.preventDefault();

    const shopName = form.name.trim();
    const shopLocation = form.location.trim();

    if (!shopName || !shopLocation) {
      await Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please enter the shop name and location.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Please enter a valid phone number.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    const normalizedForm = {
      ...form,
      name: shopName,
      location: shopLocation,
      address: form.address.trim(),
      description: form.description.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      image: form.image.trim(),
    };

    setSaving(true);
    try {
      const savedShop =
        editingId !== null
          ? await shopManagementService.updateShop(editingId, normalizedForm)
          : await shopManagementService.createShop(normalizedForm);

      if (editingId !== null) {
        setShops((previous) =>
          previous.map((shop) => (shop.id === editingId ? savedShop : shop))
        );
      } else {
        setShops((previous) => [savedShop, ...previous]);
      }

      setShowForm(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await Swal.fire({
        icon: "success",
        title: editingId !== null ? "Shop Updated!" : "Shop Created!",
        text:
          editingId !== null
            ? `${shopName} has been updated successfully.`
            : `${shopName} has been added successfully.`,
        confirmButtonColor: "#ec4899",
      });
    } catch (error) {
      console.error("Failed to save shop:", error);
      await Swal.fire({
        icon: "error",
        title: "Unable to Save Shop",
        text: error.message || "Please try again.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete shop with SweetAlert confirmation
  const handleDelete = async (shop) => {
    const result = await Swal.fire({
      title: "Delete Shop?",
      text: `Are you sure you want to delete "${shop.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setBusyShopId(shop.id);
    try {
      await shopManagementService.deleteShop(shop.id);
      setShops((previous) => previous.filter((item) => item.id !== shop.id));

      if (showDetails?.id === shop.id) {
        setShowDetails(null);
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${shop.name} has been removed.`,
        confirmButtonColor: "#ec4899",
      });
    } catch (error) {
      console.error("Failed to delete shop:", error);
      await Swal.fire({
        icon: "error",
        title: "Unable to Delete Shop",
        text: error.message || "Please try again.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setBusyShopId(null);
    }
  };

  // Toggle active / pending status
  const handleStatusToggle = async (shop) => {
    const nextStatus =
      shop.status === "Active" ? "Pending" : "Active";

    const result = await Swal.fire({
      title: "Change Shop Status?",
      text: `Change ${shop.name} to ${nextStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ec4899",
    });

    if (!result.isConfirmed) return;

    setBusyShopId(shop.id);
    try {
      const updatedShop = await shopManagementService.updateShop(shop.id, {
        ...shop,
        status: nextStatus,
      });
      setShops((previous) =>
        previous.map((item) => (item.id === shop.id ? updatedShop : item))
      );

      if (showDetails?.id === shop.id) {
        setShowDetails(updatedShop);
      }

      await Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `${shop.name} is now ${updatedShop.status}.`,
        confirmButtonColor: "#ec4899",
      });
    } catch (error) {
      console.error("Failed to update shop status:", error);
      await Swal.fire({
        icon: "error",
        title: "Unable to Update Status",
        text: error.message || "Please try again.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setBusyShopId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="min-w-0 p-4 pt-24 sm:p-6 sm:pt-24 lg:ml-[270px] lg:p-8">
        {/* Page Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 animate-[fadeIn_0.5s_ease-out] sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-pink-500">
              <FaGift size={18} />
              GIFTIFY ADMIN PANEL
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Shop{" "}
              <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your shops, locations and shop status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200 active:scale-95"
          >
            <Plus size={20} />
            Create Shop
          </button>
        </header>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Shops",
              value: shops.length,
              icon: Store,
              style: "bg-pink-100 text-pink-600",
              border: "hover:border-pink-200",
            },
            {
              label: "Active Shops",
              value: activeCount,
              icon: FaShopify,
              style: "bg-blue-100 text-blue-600",
              border: "hover:border-blue-200",
            },
            {
              label: "Pending Shops",
              value: pendingCount,
              icon: Package,
              style: "bg-purple-100 text-purple-600",
              border: "hover:border-purple-200",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6 animate-[fadeIn_0.5s_ease-out_both] ${item.border}`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold text-slate-800">
                    {loading ? "..." : loadError ? "—" : item.value}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current overview
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-4 transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${item.style}`}
                >
                  <Icon size={26} />
                </div>
              </article>
            );
          })}
        </section>

        {/* Search and Filters */}
        <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={19} className="text-pink-500" />

            <h2 className="font-bold text-slate-800">
              Search and Filter
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops..."
                className={`${inputClass} pl-11`}
              />
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={inputClass}
              aria-label="Filter by location"
            >
              <option value="All">All Locations</option>

              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </section>

        {/* Shops Heading */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
              All Shops
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredShops.length} of {shops.length} shops
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-600">
            <Sparkles size={15} />
            Shop Directory
          </div>
        </div>

        {/* Shop Cards */}
        {loading ? (
          <section
            aria-live="polite"
            className="rounded-3xl border border-slate-100 bg-white px-5 py-16 text-center shadow-sm"
          >
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-pink-500"
            />
            <p className="mt-4 font-semibold text-slate-600">
              Loading shops...
            </p>
          </section>
        ) : loadError ? (
          <section
            role="alert"
            className="rounded-3xl border border-rose-100 bg-white px-5 py-12 text-center shadow-sm"
          >
            <p className="font-semibold text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={loadShops}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-pink-600"
            >
              <RefreshCw size={17} />
              Try again
            </button>
          </section>
        ) : filteredShops.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredShops.map((shop, index) => (
              <article
                key={shop.id}
                style={{ animationDelay: `${index * 90}ms` }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/60 animate-[fadeIn_0.5s_ease-out_both]"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-pink-50 to-blue-50">
                  {shop.image ? (
                    <img
                      src={shop.image}
                      alt={shop.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-pink-300">
                      <FaGift size={55} />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                    <Store size={14} className="text-pink-500" />
                    Shop #{shop.id}
                  </div>

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                      shop.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {shop.status}
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-pink-500 to-blue-500 transition-transform duration-500 group-hover:scale-x-100" />
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold text-slate-800 transition-colors group-hover:text-pink-600">
                        {shop.name}
                      </h3>

                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin
                          size={15}
                          className="shrink-0 text-pink-500"
                        />
                        <span className="truncate">{shop.location}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDetails(shop)}
                      aria-label={`View ${shop.name}`}
                      className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600 transition hover:bg-blue-100 hover:scale-110"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  <p className="mt-4 min-h-10 text-sm leading-5 text-slate-500">
                    {shop.description || "No description available."}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                      <UserRound size={15} className="shrink-0 text-blue-500" />
                      <span className="truncate">
                        Shop Owner: {shop.owner?.name || "Owner unavailable"}
                      </span>
                    </p>
                    <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                      <Mail size={15} className="shrink-0 text-pink-500" />
                      <span className="truncate">
                        {shop.owner?.email || "Owner email unavailable"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={15} className="text-blue-500" />
                      {shop.phone || "No phone added"}
                    </p>

                    <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                      <Mail size={15} className="shrink-0 text-pink-500" />
                      <span className="truncate">
                        {shop.email || "No email added"}
                      </span>
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(shop)}
                      disabled={busyShopId === shop.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 active:scale-95"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(shop)}
                      disabled={busyShopId === shop.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2.5 text-sm font-semibold text-pink-600 transition hover:border-pink-400 hover:bg-pink-100 active:scale-95"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStatusToggle(shop)}
                    disabled={busyShopId === shop.id}
                    className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                  >
                    Change Status
                    <ArrowUpRight
                      size={14}
                      className="ml-1 inline-block"
                    />
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-pink-200 bg-gradient-to-br from-pink-50 via-white to-blue-50 px-5 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-pink-100 text-pink-500">
              <Store size={35} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-800">
              No shops found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Try another search or create a new shop to get started.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-1 hover:bg-pink-600"
            >
              <Plus size={19} />
              Create First Shop
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section className="my-auto w-full max-w-2xl animate-[fadeIn_0.2s_ease-out] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-blue-500 px-5 py-5 text-white sm:px-7">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  {editingId !== null ? "Edit Shop" : "Create New Shop"}
                </h2>

                <p className="mt-1 text-sm text-white/85">
                  Enter your shop information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-full bg-white/20 p-2 transition hover:rotate-90 hover:bg-white/30"
              >
                <X size={21} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Shop Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter shop name"
                    className={inputClass}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Location *
                  </label>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Chennai"
                    className={inputClass}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address
                  </label>

                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Full shop address"
                    className={inputClass}
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputClass}
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="shop@example.com"
                    className={inputClass}
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Shop Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Image URL
                  </label>

                  <input
                    type="url"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/shop-image.jpg"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your shop..."
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                >
                  {saving ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create Shop"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Shop Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetails(null);
            }
          }}
        >
          <section className="my-auto w-full max-w-lg animate-[fadeIn_0.2s_ease-out] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative h-52 bg-gradient-to-br from-pink-100 to-blue-100">
              {showDetails.image ? (
                <img
                  src={showDetails.image}
                  alt={showDetails.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-pink-400">
                  <FaGift size={60} />
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowDetails(null)}
                aria-label="Close shop details"
                className="absolute right-4 top-4 rounded-full bg-white p-2 text-slate-700 shadow transition hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  {showDetails.name}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    showDetails.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {showDetails.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {showDetails.description || "No description available."}
              </p>

              <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm text-slate-600">
                <p className="flex items-start gap-3">
                  <UserRound size={18} className="shrink-0 text-blue-500" />
                  <span className="min-w-0">
                    <strong className="block text-slate-800">Shop Owner</strong>
                    <span className="block truncate">
                      {showDetails.owner?.name || "Owner unavailable"}
                    </span>
                    <span className="block break-all">
                      {showDetails.owner?.email || "Owner email unavailable"}
                    </span>
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 text-pink-500" />
                  <span>
                    <strong className="block text-slate-800">Address</strong>
                    {showDetails.address || showDetails.location}
                  </span>
                </p>

                <p className="flex items-center gap-3">
                  <Phone size={18} className="text-blue-500" />
                  {showDetails.phone || "No phone added"}
                </p>

                <p className="flex items-center gap-3 break-all">
                  <Mail size={18} className="shrink-0 text-pink-500" />
                  {showDetails.email || "No email added"}
                </p>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleEdit(showDetails);
                    setShowDetails(null);
                  }}
                  className="flex-1 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  <Pencil size={16} className="mr-2 inline" />
                  Edit Shop
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(showDetails)}
                  className="flex-1 rounded-xl bg-pink-50 px-4 py-3 text-sm font-bold text-pink-600 transition hover:bg-pink-100"
                >
                  <Trash2 size={16} className="mr-2 inline" />
                  Delete
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}