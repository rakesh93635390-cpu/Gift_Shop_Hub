import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  ShieldCheck,
  UserRound,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Mail,
  Phone,
  CalendarDays,
  ChevronDown,
  Filter,
  LoaderCircle,
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import userManagementService from "../../services/userManagementService";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
};

const inputClass =
  "w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState("");
  const [statusError, setStatusError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteUser, setDeleteUser] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;

    userManagementService
      .getUsers()
      .then((loadedUsers) => {
        if (active) setUsers(loadedUsers);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || "Unable to load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user._id.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const activeCount = users.filter((user) => user.status === "Active").length;

  const adminCount = users.filter(
    (user) => user.role === "Admin"
  ).length;

  function openCreate() {
    setFormData(emptyForm);
    setSelectedUser(null);
    setFormError("");
    setModalType("create");
  }

  function openEdit(user) {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
    });
    setFormError("");
    setModalType("edit");
  }

  function closeModal() {
    setModalType("");
    setSelectedUser(null);
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email) {
      setFormError("Name and email are required.");
      return;
    }

    if (modalType === "create" && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    const emailExists = users.some(
      (user) =>
        user.email.toLowerCase() === email &&
        user._id !== selectedUser?._id
    );
    if (emailExists) {
      setFormError("This email is already in use.");
      return;
    }

    const userData = {
      name,
      email,
      role: formData.role.toLowerCase(),
      status: formData.status.toLowerCase(),
    };
    setSaving(true);
    let saved = false;
    try {
      if (modalType === "create") {
        await userManagementService.createUser({
          ...userData,
          password: formData.password,
        });
      } else if (modalType === "edit" && selectedUser) {
        await userManagementService.updateUser(selectedUser._id, userData);
      }
      saved = true;
      closeModal();
    } catch (error) {
      setFormError(error.message || "Unable to save user.");
    } finally {
      setSaving(false);
    }

    if (saved) {
      setLoadError("");
      try {
        setUsers(await userManagementService.getUsers());
      } catch (error) {
        setLoadError(error.message || "Unable to refresh users.");
      }
    }
  }

  async function toggleUserStatus(user) {
    setStatusError("");
    setStatusUpdatingUserId(user._id);
    const nextStatus = user.status === "Active" ? "inactive" : "active";

    try {
      const updatedUser = await userManagementService.updateUser(user._id, {
        status: nextStatus,
      });
      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id ? updatedUser : item
        )
      );
    } catch (error) {
      setStatusError(error.message || "Unable to update user status.");
    } finally {
      setStatusUpdatingUserId("");
    }
  }

  async function confirmDelete() {
    if (!deleteUser) return;

    setDeleteError("");
    setDeleting(true);
    try {
      await userManagementService.deleteUser(deleteUser._id);
      setUsers((previous) =>
        previous.filter((user) => user._id !== deleteUser._id)
      );
      setDeleteUser(null);
    } catch (error) {
      setDeleteError(error.message || "Unable to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  async function reloadUsers() {
    setLoading(true);
    setLoadError("");
    try {
      setUsers(await userManagementService.getUsers());
    } catch (error) {
      setLoadError(error.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <AdminNavbar />
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-sky-600">
              <Users size={17} />
              Gift Shop Hub / Management
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              User{" "}
              <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage user accounts, roles and account status.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus size={18} />
            Add User
          </button>
        </header>

        {loadError && users.length > 0 && (
          <div
            role="alert"
            className="flex flex-col justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={reloadUsers}
              className="font-semibold text-sky-700 hover:text-pink-600"
            >
              Retry loading
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={Users}
            iconClass="bg-sky-100 text-sky-600"
            gradient="from-sky-50"
          />

          <StatCard
            title="Active Users"
            value={activeCount}
            icon={UserCheck}
            iconClass="bg-sky-100 text-sky-600"
            gradient="from-sky-50"
          />

          <StatCard
            title="Administrators"
            value={adminCount}
            icon={ShieldCheck}
            iconClass="bg-pink-100 text-pink-600"
            gradient="from-pink-50"
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

        {/* Main content */}
        <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition duration-300 hover:shadow-lg hover:shadow-sky-100/70">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50/80 via-white to-pink-50/70 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold">All Users</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredUsers.length} user(s) found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-64">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search name, email, ID..."
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className={`${inputClass} appearance-none pl-9 pr-9 sm:w-36`}
                    aria-label="Filter by role"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className={`${inputClass} appearance-none pr-9 sm:w-36`}
                    aria-label="Filter by status"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Responsive table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-sky-50/80">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Joined Date</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-50">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="group animate-in fade-in slide-in-from-bottom-1 transition-colors duration-300 hover:bg-sky-50/50"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-pink-100 font-bold text-sky-700 ring-2 ring-white">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {user.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            ID: {user._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          user.role === "Admin"
                            ? "bg-pink-50 text-pink-700"
                            : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {user.role === "Admin" ? (
                          <ShieldCheck size={13} />
                        ) : (
                          <UserRound size={13} />
                        )}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user)}
                        disabled={Boolean(statusUpdatingUserId)}
                        aria-label={`Set ${user.name} ${user.status === "Active" ? "inactive" : "active"}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition duration-200 hover:scale-105 disabled:cursor-wait disabled:opacity-60 ${
                          user.status === "Active"
                            ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                            : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                        }`}
                      >
                        {statusUpdatingUserId === user._id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : user.status === "Active" ? (
                          <UserCheck size={14} />
                        ) : (
                          <UserRound size={14} />
                        )}
                        {user.status}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {user.joined
                        ? new Date(user.joined).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          label="View user"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalType("view");
                          }}
                        >
                          <Eye size={16} />
                        </ActionButton>

                        <ActionButton
                          label="Edit user"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil size={16} />
                        </ActionButton>

                        <ActionButton
                          label="Delete user"
                          danger
                          onClick={() => {
                            setDeleteError("");
                            setDeleteUser(user);
                          }}
                          >
                          <Trash2 size={16} />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      {loading ? (
                        <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                          <Users size={25} />
                        </div>
                      ) : loadError ? (
                        <div className="mx-auto max-w-md">
                          <p role="alert" className="font-semibold text-rose-600">
                            {loadError}
                          </p>
                          <button
                            type="button"
                            onClick={reloadUsers}
                            className="mt-3 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                          >
                            Try again
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                            <Search size={25} />
                          </div>
                          <p className="mt-4 font-semibold text-slate-700">
                            No users found
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Try changing your search or filters.
                          </p>
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-sky-100 bg-gradient-to-r from-sky-50/50 to-pink-50/50 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
            <span className="font-medium text-sky-600">
              Gift Shop Hub Admin
            </span>
          </div>
        </section>
      </div>

      {/* Create / Edit / View modal */}
      {modalType && selectedUser !== null && modalType === "view" && (
        <Modal onClose={closeModal} title="User Details">
          <div className="space-y-5">
            <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-sky-50 to-pink-50 p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-sky-600 shadow-sm">
                {getInitials(selectedUser.name)}
              </div>
              <h3 className="mt-3 text-lg font-bold">{selectedUser.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{selectedUser.email}</p>
              <span
                className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedUser.role === "Admin"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {selectedUser.role}
              </span>
            </div>

            <DetailRow icon={Mail} label="Email" value={selectedUser.email} />
            <DetailRow
              icon={Phone}
              label="Phone"
              value={selectedUser.phone || "Not tracked by this backend"}
            />
            <DetailRow icon={ShieldCheck} label="Status" value={selectedUser.status} />
            <DetailRow
              icon={CalendarDays}
              label="Joined"
              value={
                selectedUser.joined
                  ? new Date(selectedUser.joined).toLocaleDateString("en-IN")
                  : "Not tracked by this backend"
              }
            />

            <button
              type="button"
              onClick={closeModal}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-4 py-3 font-semibold text-white transition hover:shadow-md hover:shadow-sky-100"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {(modalType === "create" || modalType === "edit") && (
        <Modal
          onClose={closeModal}
          title={modalType === "create" ? "Add New User" : "Edit User"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Name">
              <input
                required
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                placeholder="Enter full name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Email Address">
              <input
                required
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                placeholder="name@example.com"
                className={inputClass}
              />
            </FormField>

            {modalType === "create" && (
              <FormField label="Password">
                <input
                  required
                  type="password"
                  minLength={6}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData({ ...formData, password: event.target.value })
                  }
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </FormField>
            )}

            <div
              className={`grid grid-cols-1 gap-4 ${
                modalType === "edit" ? "sm:grid-cols-2" : ""
              }`}
            >
              <FormField label="Role">
                <select
                  value={formData.role}
                  onChange={(event) =>
                    setFormData({ ...formData, role: event.target.value })
                  }
                  className={inputClass}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>
              {modalType === "edit" && (
                <FormField label="Account Status">
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData({ ...formData, status: event.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>
              )}
            </div>

            {formError && (
              <p role="alert" className="rounded-xl bg-pink-50 px-4 py-3 text-sm text-pink-700">
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-sky-200 px-4 py-3 font-semibold text-sky-700 transition hover:border-pink-200 hover:bg-pink-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-md shadow-sky-100 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : modalType === "create"
                    ? "Create User"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteUser && (
        <Modal onClose={() => setDeleteUser(null)} title="Delete User?">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <Trash2 size={28} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              Are you sure?
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              This will permanently delete <strong>{deleteUser.name}</strong>
              from the user database.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 text-sm text-pink-700">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="flex-1 rounded-xl border border-sky-200 px-4 py-3 font-semibold text-sky-700 transition hover:border-pink-200 hover:bg-pink-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconClass, gradient }) {
  return (
    <div className={`group rounded-2xl border border-sky-100 bg-gradient-to-br ${gradient} via-white to-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-pink-100 hover:shadow-lg hover:shadow-sky-100/70`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-400">Current list summary</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110 ${iconClass}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        danger
          ? "text-pink-500 hover:bg-pink-50 hover:text-pink-700"
          : "text-sky-600 hover:bg-sky-50 hover:text-pink-600"
      }`}
    >
      {children}
    </button>
  );
}

function Modal({ children, title, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:p-7"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sky-500 transition hover:bg-pink-50 hover:text-pink-600"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

export default UserManagement;