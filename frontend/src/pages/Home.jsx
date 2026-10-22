import React from "react";
import Navbar from "../components/Navbar";
import Ballpit from "../components/Ballpit";

import {
  Gift,
  Store,
  ShoppingCart,
  Package,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Footer from "../components/Footer";

const features = [
  {
    icon: Store,
    title: "Local Shops",
    description: "Discover local gift shops and explore unique collections.",
    color: "bg-cyan-100/80 text-cyan-600",
  },
  {
    icon: Gift,
    title: "Unique Gifts",
    description: "Find thoughtful gifts for every special occasion.",
    color: "bg-pink-100/80 text-pink-600",
  },
  {
    icon: ShoppingCart,
    title: "Easy Shopping",
    description: "Enjoy a simple and convenient gift shopping experience.",
    color: "bg-purple-100/80 text-purple-600",
  },
  {
    icon: Package,
    title: "Easy Orders",
    description: "Keep your orders organised and easy to track.",
    color: "bg-blue-100/80 text-blue-600",
  },
];

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-clip bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/t-2.jpg')",
      }}
    >
      {/* Ballpit Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/20 via-pink-200/20 to-rose-300/25" />

        <Ballpit
          count={40}
          colors={["#36DDE0", "#FF3D83", "#FFFFFF", "#FF8FB1"]}
          minSize={0.18}
          maxSize={0.33}
          size0={0.5}
          followCursor={true}
        />
      </div>

      <Navbar />

      {/* Responsive Home Content */}
      <div className="relative z-10 min-h-screen w-full min-w-0 px-4 pb-5 pt-20 sm:px-6 sm:pb-6 sm:pt-20 lg:ml-[270px] lg:w-[calc(100%-270px)] lg:px-8 lg:py-10 xl:px-10">
        <div className="mx-auto w-full min-w-0 max-w-6xl">

          {/* Welcome Header */}
          <header className="mb-6 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-pink-100/80 bg-gradient-to-r from-white via-pink-50/70 to-sky-50/70 px-4 py-4 shadow-lg shadow-pink-100/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-pink-200/50 sm:mb-8 sm:gap-4">

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tracking-wide text-sky-700">
                Welcome to Gift Shop Hub ✨
              </p>

              <h1 className="mt-1 break-words text-2xl font-extrabold tracking-tight text-pink-600 sm:text-3xl">
                Make every moment special.
              </h1>

              <div className="mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-pink-400 to-sky-400 shadow-sm shadow-pink-200" />
            </div>

            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-pink-100 bg-white text-pink-500 shadow-md shadow-sky-100/80 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-pink-200/70 sm:flex">
              <Gift size={25} />
            </div>

          </header>

          {/* Hero Section */}
          <section className="relative isolate w-full min-w-0 overflow-hidden rounded-[30px] border border-pink-100/80 px-4 py-10 text-center shadow-2xl shadow-pink-200/40 transition-shadow duration-500 hover:shadow-pink-200/60 sm:px-8 sm:py-14 md:px-10 md:py-20 lg:py-24">

            {/* Decorative Background Glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-pink-300/40 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-10 -z-10 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl" />

            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-48 w-3/4 -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />

            {/* Hero Badge */}
            <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-xs font-bold tracking-widest text-pink-600 shadow-md shadow-pink-100/70 backdrop-blur-md transition duration-300 hover:border-sky-200 hover:shadow-sky-100 sm:px-5">
              <Sparkles size={15} className="text-pink-500" />
              GIFTS THAT SPEAK FROM THE HEART
            </span>

            {/* Main Heading */}
            <h2 className="mx-auto mt-6 max-w-3xl break-words text-4xl font-black leading-tight tracking-tight text-sky-700 sm:mt-7 sm:text-5xl lg:text-6xl">
              Find the Perfect

              <span className="mt-2 block bg-gradient-to-r from-pink-500 via-rose-400 to-sky-500 bg-clip-text text-transparent">
                Gift 🎁
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base sm:leading-8">
              Discover unique gifts from local shops for every special moment.
              Celebrate birthdays, surprise your loved ones, and create
              beautiful memories with gifts chosen with love.
            </p>

            {/* Action Buttons */}
            <div className="mx-auto mt-7 flex w-full max-w-md flex-col justify-center gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:gap-4">

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/shop-listing";
                }}
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-pink-500 to-rose-400 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-300/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-300/60 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 sm:w-auto sm:px-7"
              >
                <Store size={18} />

                Explore Shops

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/products";
                }}
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white/85 px-5 py-3.5 text-sm font-bold text-sky-800 shadow-md shadow-sky-100/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:bg-white hover:shadow-lg hover:shadow-sky-200/50 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 sm:w-auto sm:px-7"
              >
                <Gift
                  size={18}
                  className="text-pink-500 transition-transform duration-300 group-hover:rotate-6"
                />

                Browse Gifts

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

            </div>

            {/* Feature Highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-semibold text-slate-600 sm:mt-10 sm:gap-x-7">

              <span className="flex items-center gap-2 rounded-full border border-pink-100 bg-white/60 px-3 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-pink-500 shadow-sm shadow-pink-300" />
                Thoughtful Gifts
              </span>

              <span className="flex items-center gap-2 rounded-full border border-sky-100 bg-white/60 px-3 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500 shadow-sm shadow-sky-300" />
                Local Shop Discovery
              </span>

              <span className="flex items-center gap-2 rounded-full border border-rose-100 bg-white/60 px-3 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400 shadow-sm shadow-rose-200" />
                Easy Shopping
              </span>

            </div>

          </section>

          {/* Gift Shop Content Cards - Added Only */}
          <section className="mt-6">
            <div className="mb-4 text-center">
              <p className="text-sm font-semibold text-pink-600">
                Explore Our Gift Collection
              </p>
              <h3 className="mt-1 text-2xl font-extrabold text-sky-700">
                Something Special for Everyone 🎁
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-white/80 bg-white/85 p-5 shadow-lg shadow-pink-100/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200/60"
                  >
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon size={21} />
                    </div>

                    <h4 className="text-base font-bold text-slate-800">
                      {feature.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <Footer/>
    </main>
  );
}