"use client";

import CalendarMonth from "@/components/CalendarMonth";

export default function CalendarPage() {
  return (
    <main className="flex flex-col items-center justify-center p-10">
      <h1 className="text-2xl font-bold mb-6">Calendario Lezioni</h1>
      <CalendarMonth />
    </main>
  );
}
