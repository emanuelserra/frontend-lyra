"use client";

import { ProtectedRoute, PageBreadcrumb } from "@/components/shared";
import ReportsRouter from "@/components/report/ReportsRouter";

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={["admin", "professor", "tutor", "student"]}>
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-7xl mx-auto p-6">
          <PageBreadcrumb items={[{ label: "Report" }]} />
          <ReportsRouter />
        </div>
      </div>
    </ProtectedRoute>
  );
}