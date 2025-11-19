"use client";

import { ProtectedRoute, PageBreadcrumb } from "@/components/shared";
import ExamsPage from "../../components/exams/ExamPage";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["admin", "professor", "tutor", "student"]}>
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-7xl mx-auto p-6">
          <PageBreadcrumb items={[{ label: "Esami" }]} />
          <ExamsPage />
        </div>
      </div>
    </ProtectedRoute>
  );
}