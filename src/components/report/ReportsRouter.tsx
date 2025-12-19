"use client";

import { useMemo } from "react";
import { getUserRole } from "@/lib/utils/role-utils";

import StudentReport from "@/components/report/StudentsReport";
import ReportsPage from "@/components/report/ReportsPage"; 

export default function ReportsRouter() {
  const role = useMemo(() => getUserRole(), []);

  if (role === "student") return <StudentReport />;

  // tutor, professor, admin
  return <ReportsPage />;
}
