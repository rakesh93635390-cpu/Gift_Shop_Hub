import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Gift,
  Sparkles,
  ShoppingBag,
  Heart,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) return;

    setServerError("");
    setIsSubmitting(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:7000/api/auth";

      const response = await axios.post(`${apiUrl}/login`, {
        email: email.trim(),
        password,
      });

      const data = response.data;

      if (!data.token) {
        setServerError(
          "Login response did not include an authentication token."
        );
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setServerError(
        error.response?.data?.message ||
          "Unable to connect to server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
    setServerError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
    setServerError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-pink-100 px-4 py-8 sm:px-6 lg:px-10">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-pink-300/30 blur-3xl" />

      {/* Main layout */}
      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/80 bg-white/70 shadow-2xl shadow-sky-200/50 backdrop-blur-xl lg:min-h-[650px] lg:grid-cols-2">

        {/* LEFT SIDE - Gift Image */}
        <div className="relative flex min-h-[280px] flex-col justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-pink-50 to-sky-100 p-6 sm:min-h-[340px] sm:p-10 lg:min-h-full lg:p-12">

          {/* Decorative circles */}
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-pink-300/30 blur-2xl" />
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-sky-300/40 blur-2xl" />

          <Gift className="absolute left-8 top-8 animate-bounce text-pink-400/70 [animation-duration:4s]" size={34} />
          <Sparkles className="absolute right-10 top-12 animate-pulse text-sky-500" size={30} />
          <Heart className="absolute bottom-8 left-10 animate-pulse text-pink-400" size={26} />

          <div className="relative mx-auto w-full max-w-md text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold tracking-widest text-pink-600 shadow-sm sm:text-sm">
              <Gift size={16} />
              GIFT SHOP HUB
              <Sparkles size={15} className="text-sky-500" />
            </div>

            <h1 className="mb-3 text-3xl font-extrabold leading-tight text-slate-800 sm:text-4xl lg:text-5xl">
              Make Every
              <span className="block bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
                Moment Special!
              </span>
            </h1>

            <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
              Find thoughtful gifts, share happiness, and make every
              celebration unforgettable.
            </p>

            {/* Example image URL */}
            <div className="group relative mx-auto max-w-sm animate-[float_4s_ease-in-out_infinite]">
              <div className="absolute -inset-3 rounded-[30px] bg-gradient-to-r from-pink-300/50 to-sky-300/50 opacity-70 blur-xl transition duration-500 group-hover:opacity-100" />

              <img
                src="/LoginIM.jpg"
                alt="Beautiful wrapped gifts and presents"
                className="relative h-48 w-full rounded-[24px] border-4 border-white/80 object-cover shadow-xl transition duration-500 group-hover:scale-[1.02] sm:h-64 lg:h-72"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600 sm:gap-5 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Heart size={16} className="text-pink-500" />
                Gifts with Love
              </span>
              <span className="flex items-center gap-1.5">
                <ShoppingBag size={16} className="text-sky-600" />
                Happy Shopping
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="flex items-center justify-center bg-white/85 px-5 py-8 sm:px-10 sm:py-10 lg:px-12">

          <div className="w-full max-w-md">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-pink-400 text-white shadow-lg shadow-pink-200 transition duration-300 hover:rotate-6 hover:scale-110">
                <Gift size={34} />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                Welcome Back!
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue shopping with us
              </p>

              <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-sky-400 to-pink-500" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600">
                  EMAIL ADDRESS
                </label>

                <div
                  className={`flex items-center rounded-xl border bg-slate-50 px-4 py-3.5 transition duration-300 focus-within:bg-white focus-within:shadow-md focus-within:shadow-pink-100 ${
                    errors.email
                      ? "border-red-400"
                      : "border-slate-200 focus-within:border-pink-400"
                  }`}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />

                  {email.includes("@") && !errors.email && (
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-sky-500"
                    />
                  )}
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600">
                  PASSWORD
                </label>

                <div
                  className={`flex items-center rounded-xl border bg-slate-50 px-4 py-3.5 transition duration-300 focus-within:bg-white focus-within:shadow-md focus-within:shadow-pink-100 ${
                    errors.password
                      ? "border-red-400"
                      : "border-slate-200 focus-within:border-pink-400"
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-transparent pr-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 text-slate-400 transition hover:scale-110 hover:text-pink-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <p role="alert" className="text-sm leading-relaxed text-red-500">
                  {serverError}
                </p>
              )}

              {/* Sign In */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-200/70 transition duration-300 hover:-translate-y-0.5 hover:from-pink-600 hover:to-rose-500 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <Gift size={18} className="relative" />

                <span className="relative">
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-sky-100" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400">
                OR
              </span>
              <div className="h-px flex-1 bg-pink-100" />
            </div>

            {/* Guest */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white py-3 text-sm font-bold text-sky-700 transition duration-300 hover:-translate-y-0.5 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 hover:shadow-md active:scale-[0.98]"
            >
              <ShoppingBag
                size={17}
                className="transition group-hover:scale-110"
              />
              Continue as Guest
            </button>

            {/* Register Link */}
            <div className="mt-7 text-center text-sm text-slate-500">
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-bold text-pink-500 transition hover:text-sky-600 hover:underline"
              >
                Create Account
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Heart size={13} className="text-pink-400" />
              Made for gifting moments
              <Sparkles size={13} className="text-sky-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
