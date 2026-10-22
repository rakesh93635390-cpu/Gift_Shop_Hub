import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock3,
  Eye,
  Filter,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../services/orderManagementService";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES = {
  pending: "border-pink-200 bg-pink-50 text-pink-700",
  processing: "border-sky-200 bg-sky-50 text-sky-700",
  shipped: "border-sky-200 bg-sky-100 text-sky-800",
  delivered: "border-pink-200 bg-pink-100 text-pink-800",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};

const STATUS_ICONS = {
  pending: Clock3,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const inputClass =
  "w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

function formatStatus(status = "pending") {
  const normalized = status.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getOrderItems(order) {
  return Array.isArray(order.products) ? order.products : [];
}

function getProduct(item) {
  return item.productId && typeof item.productId === "object"
    ? item.productId
    : item.product && typeof item.product === "object"
      ? item.product
      : item;
}

function getProductName(item) {
  const product = getProduct(item);
  return product.productName || product.name || product.title || "Gift item";
}

function formatPrice(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function StatusBadge({ status = "pending" }) {
  const normalized = status.toLowerCase();
  const Icon = STATUS_ICONS[normalized] || Package;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${
        STATUS_STYLES[normalized] || STATUS_STYLES.pending
      }`}
    >
      <Icon size={14} />
      {normalized}
    </span>
  );
}

function OrderDetails({
  order,
  onClose,
  onStatusChange,
  updating,
  statusError,
}) {
  const customer =
    order.userID && typeof order.userID === "object" ? order.userID : {};
  const address = order.customerAddress || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="my-auto max-h-[90vh] w-full max-w-2xl animate-in fade-in zoom-in-95 overflow-y-auto rounded-3xl border border-sky-100 bg-white p-5 shadow-2xl duration-200 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
              Order details
            </p>
            <h2
              id="order-details-title"
              className="mt-1 break-all text-xl font-extrabold text-slate-800"
            >
              #{String(order._id || "").slice(-12)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sky-600 transition hover:bg-pink-50 hover:text-pink-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sky-700">
              <UserRound size={17} />
              <h3 className="font-bold">Customer</h3>
            </div>
            <p className="font-semibold text-slate-800">
              {address.name || customer.name || "Name unavailable"}
            </p>
            <p className="mt-1 break-all text-sm text-slate-500">
              {customer.email || "Email unavailable"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {address.phone || "Phone unavailable"}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-white p-4">
            <div className="mb-3 flex items-center gap-2 text-pink-700">
              <MapPin size={17} />
              <h3 className="font-bold">Delivery address</h3>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {[
                address.address,
                address.city,
                address.state,
                address.pincode,
              ]
                .filter(Boolean)
                .join(", ") || "Address unavailable"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <ShoppingBag size={17} className="text-sky-600" />
            Items ({getOrderItems(order).length})
          </h3>
          <div className="space-y-2">
            {getOrderItems(order).map((item, index) => {
              const product = getProduct(item);
              return (
                <div
                  key={item._id || product._id || index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-sky-50 bg-sky-50/50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-pink-500 shadow-sm">
                      <Package size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {getProductName(item)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Quantity: {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                  {product.productPrice != null && (
                    <span className="shrink-0 text-sm font-bold text-pink-600">
                      {formatPrice(
                        Number(product.productPrice) * Number(item.quantity || 1)
                      )}
                    </span>
                  )}
                </div>
              );
            })}
            {getOrderItems(order).length === 0 && (
              <p className="rounded-xl bg-sky-50 p-4 text-sm text-slate-500">
                Item details are unavailable.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-sky-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order total
            </p>
            <p className="mt-1 text-2xl font-extrabold text-pink-600">
              {formatPrice(order.totalPrice)}
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="order-detail-status"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Update status
            </label>
            <select
              id="order-detail-status"
              value={(order.orderStatus || "pending").toLowerCase()}
              onChange={(event) => onStatusChange(order, event.target.value)}
              disabled={updating}
              className={inputClass}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {statusError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-pink-50 p-3 text-sm font-medium text-pink-700"
          >
            {statusError}
          </p>
        )}
      </section>
    </div>
  );
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await getAdminOrders());
    } catch (requestError) {
      setError(requestError.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const customer =
        order.userID && typeof order.userID === "object" ? order.userID : {};
      const searchable = [
        order._id,
        customer.name,
        customer.email,
        order.customerAddress?.name,
        ...getOrderItems(order).map(getProductName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchable.includes(search);
      const matchesStatus =
        statusFilter === "all" ||
        (order.orderStatus || "pending").toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const inProgressCount = orders.filter((order) =>
    ["pending", "processing", "shipped"].includes(
      (order.orderStatus || "pending").toLowerCase()
    )
  ).length;
  const deliveredCount = orders.filter(
    (order) => (order.orderStatus || "").toLowerCase() === "delivered"
  ).length;

  async function handleStatusChange(order, nextStatus) {
    if ((order.orderStatus || "pending").toLowerCase() === nextStatus) return;

    setStatusError("");
    setUpdatingOrderId(String(order._id));
    try {
      const updatedOrder = await updateAdminOrderStatus(order._id, nextStatus);
      setOrders((previous) =>
        previous.map((item) =>
          item._id === updatedOrder._id ? updatedOrder : item
        )
      );
      setSelectedOrder((current) =>
        current?._id === updatedOrder._id ? updatedOrder : current
      );
    } catch (requestError) {
      setStatusError(requestError.message || "Unable to update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-sky-50 text-slate-800">
      <AdminNavbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-8 pt-24 sm:px-6 lg:ml-[270px] lg:w-[calc(100%-270px)] lg:px-8 lg:pt-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-pink-600">
              <ShoppingBag size={17} />
              Gift Shop Hub / Management
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Order{" "}
              <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review customer orders and keep delivery statuses up to date.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh orders
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total orders"
            value={orders.length}
            icon={ShoppingBag}
            color="pink"
          />
          <SummaryCard
            title="In progress"
            value={inProgressCount}
            icon={Truck}
            color="sky"
          />
          <SummaryCard
            title="Delivered"
            value={deliveredCount}
            icon={CheckCircle}
            color="pink"
          />
        </section>

        {statusError && (
          <p
            role="alert"
            className="rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm font-medium text-pink-700"
          >
            {statusError}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition duration-300 hover:shadow-lg hover:shadow-sky-100/70">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-pink-50/70 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">All orders</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredOrders.length} order(s) found
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search order, customer, item..."
                  aria-label="Search orders"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pink-500"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter orders by status"
                  className={`${inputClass} appearance-none pl-9 pr-10 sm:w-48`}
                >
                  <option value="all">All statuses</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-sky-600">
              <LoaderCircle size={34} className="animate-spin" />
              <p className="text-sm font-medium">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <p role="alert" className="font-semibold text-pink-700">
                {error}
              </p>
              <button
                type="button"
                onClick={loadOrders}
                className="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-md"
              >
                Try again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-sky-100 text-pink-600">
                <Package size={28} />
              </span>
              <h3 className="mt-4 font-bold text-slate-800">
                {orders.length === 0 ? "No orders yet" : "No matching orders"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {orders.length === 0
                  ? "New customer orders will appear here."
                  : "Try another search or status filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-sky-50">
              {filteredOrders.map((order, index) => {
                const orderId = String(order._id || "");
                const status = (order.orderStatus || "pending").toLowerCase();
                const customer =
                  order.userID && typeof order.userID === "object"
                    ? order.userID
                    : {};
                const items = getOrderItems(order);

                return (
                  <article
                    key={orderId}
                    className="animate-in fade-in slide-in-from-bottom-1 p-5 transition-colors duration-200 hover:bg-sky-50/40 sm:p-6"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-all font-bold text-slate-800">
                            Order #{orderId.slice(-12) || "N/A"}
                          </h3>
                          <StatusBadge status={status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound size={15} className="text-sky-500" />
                            {order.customerAddress?.name ||
                              customer.name ||
                              "Customer"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} className="text-pink-500" />
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Date unavailable"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Package size={15} className="text-sky-500" />
                            {items.length} item(s)
                          </span>
                        </div>
                        <p className="mt-2 truncate text-sm text-slate-500">
                          {items.slice(0, 3).map(getProductName).join(", ") ||
                            "Item details unavailable"}
                          {items.length > 3 ? ` +${items.length - 3} more` : ""}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                        <p className="text-lg font-extrabold text-pink-600">
                          {formatPrice(order.totalPrice)}
                        </p>
                        <div className="relative">
                          <select
                            value={status}
                            onChange={(event) =>
                              handleStatusChange(order, event.target.value)
                            }
                            disabled={Boolean(updatingOrderId)}
                            aria-label={`Update status for order ${orderId}`}
                            className={`${inputClass} appearance-none pr-9 sm:w-40`}
                          >
                            {ORDER_STATUSES.map((option) => (
                              <option key={option} value={option}>
                                {formatStatus(option)}
                              </option>
                            ))}
                          </select>
                          {updatingOrderId === orderId ? (
                            <LoaderCircle
                              size={15}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-sky-600"
                            />
                          ) : (
                            <ChevronDown
                              size={15}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                        >
                          <Eye size={16} />
                          Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          updating={Boolean(updatingOrderId)}
          statusError={statusError}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  const isPink = color === "pink";
  return (
    <div className="group rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-white to-pink-50/70 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg hover:shadow-sky-100/70">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-800">{value}</p>
          <p className="mt-1 text-xs text-slate-400">Current order summary</p>
        </div>
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110 ${
            isPink ? "bg-pink-100 text-pink-600" : "bg-sky-100 text-sky-600"
          }`}
        >
          <Icon size={23} />
        </span>
      </div>
    </div>
  );
}
