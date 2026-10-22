import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { Gift, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      setError("Please fill all the fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message || `Registration failed (${response.status})`
        );
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: "Your Gift Shop account has been created successfully ",
        confirmButtonText: "Continue",
        confirmButtonColor: "#ec4899",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } catch (error) {
      console.error("Register error:", error);

      setError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br  px-4 py-8 font-sans sm:px-6 lg:px-8" >
      <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 animate-pulse rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 animate-pulse rounded-full bg-pink-300/40 blur-3xl [animation-delay:1000ms]" />
      <div className="pointer-events-none absolute right-[15%] top-[12%] h-36 w-36 animate-bounce rounded-full bg-white/70 blur-2xl [animation-duration:5s]" />
      <div className="pointer-events-none absolute bottom-[12%] left-[12%] h-32 w-32 animate-pulse rounded-full bg-pink-200/40 blur-2xl" />

      <div className="pointer-events-none absolute left-[7%] top-[15%] hidden animate-bounce text-sky-500/60 [animation-duration:4s] sm:block">
        <Gift size={48} strokeWidth={1.4} />
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[17%] animate-pulse text-pink-400/70">
        <Sparkles size={34} strokeWidth={1.5} />
      </div>
      <div className="pointer-events-none absolute bottom-[16%] left-[10%] hidden animate-bounce text-pink-400/60 [animation-duration:5s] sm:block">
        <ShoppingBag size={44} strokeWidth={1.4} />
      </div>
      <div className="pointer-events-none absolute bottom-[17%] right-[9%] animate-pulse text-sky-500/60">
        <Heart size={32} strokeWidth={1.5} />
      </div>

      <div className="pointer-events-none absolute left-[23%] top-[32%] animate-ping text-sky-400/50">
        <Sparkles size={50} />
      </div>
      <div className="pointer-events-none absolute left-[16%] top-[27%] animate-ping text-sky-400/50 [animation-delay:9000ms]">
        <Sparkles size={50} />
      </div>
      <div className="pointer-events-none absolute bottom-[30%] right-[22%] animate-ping text-pink-400/50 [animation-delay:90ms]">
        <Sparkles size={50} />
      </div>
      <div className="pointer-events-none absolute bottom-[25%] right-[15%] animate-ping text-pink-400/50 [animation-delay:2000ms]">
        <Sparkles size={50} />
      </div>

      <div className="relative z-10 w-full max-w-5xl animate-[fade-in_700ms_ease-out] overflow-hidden rounded-[32px] border border-white/30 bg-white/20 shadow-2xl shadow-sky-200/60 backdrop-blur-xl transition duration-300 hover:shadow-pink-200/60">
        <div className="flex flex-col lg:flex-row">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-400 via-sky-300 to-pink-400 p-6 sm:p-8 lg:p-10">
            <div className="absolute -left-8 top-10 h-28 w-28 rounded-full border border-white/30 bg-white/15" />
            <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full border border-white/30 bg-white/15" />
            <div className="absolute left-8 top-8 h-20 w-20 animate-pulse rounded-full bg-pink-200/30 blur-sm" />
            <div className="absolute right-10 bottom-12 h-16 w-16 animate-pulse rounded-full bg-sky-200/30 blur-sm" />

            <div className="relative z-10 max-w-sm text-center text-white">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/50 bg-white/15 shadow-lg backdrop-blur-md transition duration-300 hover:scale-110 hover:rotate-6 sm:h-24 sm:w-24">
                <Gift size={52} strokeWidth={1.8} className="drop-shadow-sm" />
              </div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/85">
                Gift Shop Hub
              </p>

              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                Create your
                <span className="block">perfect gift profile</span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Discover thoughtful surprises, save your favorites, and make every occasion unforgettable.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110">
                  <Sparkles size={18} />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110">
                  <Heart size={18} />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 shadow-md backdrop-blur-sm transition duration-300 hover:scale-110">
                  <ShoppingBag size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="mb-7">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                  Create Account
                </h1>
                <Gift
                  size={22}
                  className="text-pink-500 transition duration-300 hover:rotate-12 hover:scale-110"
                />
              </div>

              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                Make every celebration memorable with us
              </p>

              <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-sky-400 to-pink-400 transition-all duration-500 hover:w-20" />
            </div>

            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-sky-600 transition-colors duration-200 hover:text-pink-500"
                  >
                    Login
                  </Link>
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-300 focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
                  <FiUser size={20} className="text-sky-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 w-full bg-transparent px-1 text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-300 focus-within:border-pink-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-100">
                  <FiMail size={20} className="text-pink-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 w-full bg-transparent px-1 text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-300 focus-within:border-sky-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
                  <FiLock size={20} className="text-sky-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="h-12 w-full bg-transparent px-1 text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-sky-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 transition-all duration-300 focus-within:border-pink-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-pink-100">
                  <FiLock size={20} className="text-pink-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="h-12 w-full bg-transparent px-1 text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-pink-500"
                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-center text-sm font-medium text-red-500">{error}</p>
              )}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-base font-semibold text-white shadow-md shadow-pink-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-pink-600 hover:to-pink-700 hover:shadow-lg hover:shadow-pink-200 active:scale-[0.99]"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;