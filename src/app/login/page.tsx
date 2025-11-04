"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.login({ email, password });
      router.push("/home");
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Email o password errati";
      setError(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    } finally {
      setLoading(false);
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

          {error && (
            <div className="bg-red-500/80 text-white text-sm p-2 rounded mb-3 text-center">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            className="border border-white/40 bg-white/40 text-stone-900 p-2 w-full mb-3 rounded placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[var(--oro)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-white/40 bg-white/40 text-stone-900 p-2 w-full mb-4 rounded placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[var(--oro)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--bordeaux)] hover:bg-[#6B0F27] text-white p-2 w-full rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>
      </div>
    </main>
  );
}
