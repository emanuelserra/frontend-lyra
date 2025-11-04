'use client'

import { ProtectedRoute, PageBreadcrumb } from '@/components/shared'

function ExamsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <PageBreadcrumb items={[{ label: 'Esami' }]} />
        <h1 className="text-3xl font-bold mb-6">Esami</h1>
        <p className="text-gray-600">
          Gestione esami e voti - In sviluppo
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'professor', 'tutor', 'student']}>
      <ExamsPage />
    </ProtectedRoute>
  )
}
