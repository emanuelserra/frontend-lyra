"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // ESEMPIO: login statico
    if (email === "test@email.com" && password === "password") {
      localStorage.setItem("loggedIn", "true");
      router.push("/home");
    } else {
      alert("Email o password errati");
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* 🔹 Sfondo animato identico alla landing */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-white via-[var(--bordeaux)] to-[var(--oro)] bg-[length:300%_300%] animate-gradient-move"
      ></div>

      {/* 🔹 Contenuto principale (login form) */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Logo */}
        <div className="mb-6 overflow-hidden rounded-xl animate-logo-glow">
          <Image
            src="/logo.png"
            alt="Lyra Logo"
            width={180}
            height={100}
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Box di login */}
        <form
          onSubmit={handleLogin}
          className="bg-white/25 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 w-80"
        >
          <h2 className="text-white font-semibold mb-4 text-center drop-shadow-md">
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="border border-white/40 bg-white/40 text-stone-900 p-2 w-full mb-3 rounded placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[var(--oro)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-white/40 bg-white/40 text-stone-900 p-2 w-full mb-4 rounded placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[var(--oro)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-[var(--bordeaux)] hover:bg-[#6B0F27] text-white p-2 w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Accedi
          </button>
        </form>
      </div>
    </main>
  );
}
