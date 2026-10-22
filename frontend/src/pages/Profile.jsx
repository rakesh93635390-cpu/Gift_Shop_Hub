import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  changePassword,
  getProfile as fetchProfile,
  updateProfile,
} from "../services/profileService";
import Swal from "sweetalert2";
import {
  UserRound,
  Mail,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Gift,
  Sparkles,
  Pencil,
  X,
  Save,
  LockKeyhole,
  Eye,
  EyeOff,
  House,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetchProfile();

        const data = response.data;
        const profileData = data.user || data.profile || data;

        setUser(profileData);
        localStorage.setItem("user", JSON.stringify(profileData));
      } catch (err) {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  const openEditProfile = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setShowEdit(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email) {
      await Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please enter both your name and email.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    try {
      setSaving(true);

      // Confirm that your backend supports PUT on this endpoint.
      const response = await updateProfile({ name, email });

      const responseData = response.data;
      const updatedUser =
        responseData.user ||
        responseData.profile ||
        responseData;

      // Update local data only after the API succeeds.
      const profileData = {
        ...user,
        ...updatedUser,
        name: updatedUser.name || name,
        email: updatedUser.email || email,
      };

      setUser(profileData);
      localStorage.setItem("user", JSON.stringify(profileData));
      setShowEdit(false);

      await Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile details have been saved successfully.",
        confirmButtonColor: "#ec4899",
        timer: 2200,
        timerProgressBar: true,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          err.response?.data?.message ||
          "Could not update your profile. Please check your backend API.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setSaving(false);
    }
  };

  const openChangePassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
    setShowChangePassword(true);
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      await Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please fill in all password fields.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    if (newPassword.length < 6) {
      await Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Your new password must be at least 6 characters long.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "Please make sure the new password and confirmation match.",
        confirmButtonColor: "#ec4899",
      });
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({ currentPassword, newPassword });

      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      await Swal.fire({
        icon: "success",
        title: "Password Changed!",
        text: "Your password has been updated successfully.",
        confirmButtonColor: "#ec4899",
        timer: 2200,
        timerProgressBar: true,
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Change Password Failed",
        text:
          err.response?.data?.message ||
          "Could not change your password. Please try again.",
        confirmButtonColor: "#ec4899",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout from your account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Stay",
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#94a3b8",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      await Swal.fire({
        icon: "success",
        title: "Logged Out!",
        text: "You have logged out successfully.",
        confirmButtonColor: "#ec4899",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/login", { replace: true });
    }
  };

  const userName = user?.name || "User";
  const initial = userName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-sky-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
          <p className="font-medium text-gray-600">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-pink-50 to-sky-50 px-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          <RefreshCw size={28} className="mx-auto mb-4 text-pink-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Unable to load profile
          </h2>
          <p className="mb-5 text-sm text-red-500">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-sky-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute -left-16 top-6 h-72 w-72 animate-pulse rounded-full bg-pink-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-12 h-80 w-80 animate-pulse rounded-full bg-sky-200/60 blur-3xl [animation-delay:800ms]" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 animate-pulse rounded-full bg-white/80 blur-3xl [animation-delay:1200ms]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 animate-pulse rounded-full bg-pink-100/80 blur-3xl [animation-delay:1600ms]" />

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-4 py-2 text-sm font-medium text-pink-600 shadow-sm">
            <Gift size={17} />
            Gift Shop Hub
          </div>

          <h1 className="text-3xl font-extrabold text-gray-800 sm:text-4xl">
            My <span className="text-pink-500">Profile</span>
          </h1>

          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            Manage your account and personal details.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-pink-100/60">
          <div className="relative h-24 overflow-hidden bg-gradient-to-r from-pink-400 via-pink-500 to-sky-400 sm:h-28">
            <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-white/10" />

            <Sparkles
              className="absolute right-8 top-8 text-white/80"
              size={25}
            />
            <Gift
              className="absolute bottom-5 left-8 text-white/70"
              size={30}
            />

            <div className="absolute bottom-5 right-6 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={15} />
                Your Account
              </span>
            </div>
          </div>

          <div className="px-5 pb-7 sm:px-10">
            <div className="relative z-10 -mt-12 mb-5 flex flex-col items-center text-center sm:-mt-14">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-pink-100 to-sky-100 text-4xl font-extrabold text-pink-600 shadow-lg sm:h-28 sm:w-28 sm:text-5xl">
                {initial}
              </div>

              <h2 className="mt-4 break-words text-2xl font-bold text-gray-800">
                {userName}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Welcome to your Gift Shop Hub account!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-pink-500 shadow-sm">
                  <UserRound size={23} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Full Name
                  </p>
                  <p className="mt-1 break-words font-semibold text-gray-800">
                    {user?.name || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                  <Mail size={23} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Email Address
                  </p>
                  <p className="mt-1 break-all font-semibold text-gray-800">
                    {user?.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                onClick={openEditProfile}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-white px-5 py-3.5 font-semibold text-pink-600 transition hover:border-pink-400 hover:bg-pink-50"
              >
                <Pencil size={18} />
                Edit Profile
              </button>

              <button
                onClick={openChangePassword}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-sky-200 bg-white px-5 py-3.5 font-semibold text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
              >
                <LockKeyhole size={18} />
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <LogOut size={19} />
                Logout
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3.5 font-semibold text-white shadow-md shadow-sky-200 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <House size={19} />
                Move to Home
              </button>
            </div>

          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Made with ♥ for every special moment
        </p>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => !saving && setShowEdit(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="my-auto w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                  <Pencil size={23} />
                </div>
                <h2
                  id="edit-profile-title"
                  className="text-2xl font-bold text-gray-800"
                >
                  Edit Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your personal details.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowEdit(false)}
                aria-label="Close edit profile"
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 transition focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-50">
                  <UserRound size={19} className="shrink-0 text-pink-500" />
                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="w-full bg-transparent py-3.5 text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50">
                  <Mail size={19} className="shrink-0 text-sky-500" />
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent py-3.5 text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowEdit(false)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-3 font-semibold text-white shadow-md shadow-pink-100 transition hover:from-pink-600 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => !savingPassword && setShowChangePassword(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <LockKeyhole size={23} />
                </div>
                <h2
                  id="change-password-title"
                  className="text-2xl font-bold text-gray-800"
                >
                  Change Password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a new password for your account.
                </p>
              </div>

              <button
                type="button"
                disabled={savingPassword}
                onClick={() => setShowChangePassword(false)}
                aria-label="Close change password"
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {[
                {
                  name: "currentPassword",
                  label: "Current Password",
                  autoComplete: "current-password",
                },
                {
                  name: "newPassword",
                  label: "New Password",
                  autoComplete: "new-password",
                },
                {
                  name: "confirmPassword",
                  label: "Confirm New Password",
                  autoComplete: "new-password",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={`password-${field.name}`}
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    {field.label}
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50">
                    <LockKeyhole
                      size={19}
                      className="shrink-0 text-sky-500"
                    />
                    <input
                      id={`password-${field.name}`}
                      name={field.name}
                      type={
                        passwordVisibility[field.name] ? "text" : "password"
                      }
                      value={passwordForm[field.name]}
                      onChange={handlePasswordInputChange}
                      required
                      minLength={field.name === "currentPassword" ? undefined : 6}
                      autoComplete={field.autoComplete}
                      placeholder={field.label}
                      className="w-full bg-transparent py-3.5 text-gray-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.name)}
                      aria-label={`${
                        passwordVisibility[field.name] ? "Hide" : "Show"
                      } ${field.label.toLowerCase()}`}
                      className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      {passwordVisibility[field.name] ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  disabled={savingPassword}
                  onClick={() => setShowChangePassword(false)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-pink-500 to-pink-600 px-5 py-3 font-semibold text-white shadow-md shadow-pink-100 transition hover:from-pink-600 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingPassword ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
