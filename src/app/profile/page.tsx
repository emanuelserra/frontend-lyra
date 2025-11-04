'use client'

import { ProtectedRoute } from '@/components/shared'

function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Profilo</h1>
        <p className="text-gray-600">
          Il mio profilo - In sviluppo
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'professor', 'tutor', 'student']}>
      <ProfilePage />
    </ProtectedRoute>
  )
}
