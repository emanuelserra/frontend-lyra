"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      aria-label="Landing page Lyra"
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
    >
      {/* Sfondo animato */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-white via-[var(--bordeaux)] to-[var(--oro)] bg-[length:200%_200%] animate-gradient-move"
      />

      {/* Pannello principale */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-8 sm:px-10 py-10 sm:py-12 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/25 border border-white/20 transition-all duration-700 ease-out transform ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        role="region"
        aria-labelledby="lyra-heading"
      >
        {/* Logo */}
        <div className="mb-6 overflow-hidden rounded-xl animate-logo-glow">
          <Image
            src="/logo.png"
            alt="Logo della piattaforma Lyra"
            width={180}
            height={100}
            className="object-contain rounded-xl"
            priority
          />
        </div>

        {/* Titolo */}
        <h1 id="lyra-heading" className="text-4xl md:text-5xl font-bold mb-3 text-white drop-shadow-lg">
          Benvenuto su Lyra
        </h1>

        {/* Sottotitolo */}
        <p className="text-lg text-white/90 mb-8 max-w-md drop-shadow-md">
          La piattaforma intelligente per la gestione scolastica moderna.
        </p>

        {/* Bottone */}
        <button
          onClick={() => router.push("/login")}
          aria-label="Vai al login di Lyra"
          className="px-8 py-3 bg-[var(--bordeaux)] hover:bg-[#6B0F27] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[rgba(184,139,74,0.18)]"
        >
          Vai al Login
        </button>

        {/* Footer */}
        <p className="text-sm text-white/50 mt-8 drop-shadow-sm">
          © {new Date().getFullYear()} Lyra. Tutti i diritti riservati.
        </p>
      </div>
    </main>
  );
}

