'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { studentsService, type Student } from '@/services/students.service'
import { CheckCircle, XCircle, Clock, LogOut } from 'lucide-react'

interface AttendanceData {
  student_id: number
  status: 'present' | 'absent' | 'late' | 'early_exit'
  justified: boolean
  note?: string
}

interface AttendanceFormProps {
  lesson_id: number
  courseId: number
  onSubmit: (attendances: AttendanceData[]) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function AttendanceForm({
  lesson_id,
  courseId,
  onSubmit,
  onCancel,
  loading = false,
}: AttendanceFormProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [attendances, setAttendances] = useState<Map<number, AttendanceData>>(new Map())

  useEffect(() => {
    async function fetchStudents() {
      try {
        const allStudents = await studentsService.getAllStudents()
        const courseStudents = allStudents.filter(s => s.course_id === courseId)
        setStudents(courseStudents)

        // Initialize all as present
        const initialAttendances = new Map<number, AttendanceData>()
        courseStudents.forEach(student => {
          initialAttendances.set(student.id, {
            student_id: student.id,
            status: 'present',
            justified: false,
          })
        })
        setAttendances(initialAttendances)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [courseId])

  function updateAttendance(studentId: number, updates: Partial<AttendanceData>) {
    setAttendances(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(studentId)
      if (current) {
        newMap.set(studentId, { ...current, ...updates })
      }
      return newMap
    })
  }

  async function handleSubmit() {
    const attendanceList = Array.from(attendances.values())
    await onSubmit(attendanceList)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'late':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'early_exit':
        return <LogOut className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  if (loadingStudents) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {students.length} studenti da registrare
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Presente</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Assente</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Ritardo</span>
          </div>
          <div className="flex items-center gap-1">
            <LogOut className="w-4 h-4 text-blue-500" />
            <span>Uscita anticipata</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {students.map(student => {
          const attendance = attendances.get(student.id)
          if (!attendance) return null

          return (
            <div
              key={student.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Student Info */}
                <div className="col-span-3">
                  <p className="font-medium">
                    {student.user?.first_name} {student.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{student.enrollment_number}</p>
                </div>

                {/* Status Select */}
                <div className="col-span-3">
                  <Select
                    value={attendance.status}
                    onValueChange={value =>
                      updateAttendance(student.id, {
                        status: value as AttendanceData['status'],
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(attendance.status)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Presente</SelectItem>
                      <SelectItem value="absent">Assente</SelectItem>
                      <SelectItem value="late">In ritardo</SelectItem>
                      <SelectItem value="early_exit">Uscita anticipata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Justified Checkbox */}
                <div className="col-span-2 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attendance.justified}
                      onChange={e =>
                        updateAttendance(student.id, { justified: e.target.checked })
                      }
                      disabled={loading}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Giustificato</span>
                  </label>
                </div>

                {/* Note */}
                <div className="col-span-4">
                  <Input
                    placeholder="Note (opzionale)"
                    value={attendance.note || ''}
                    onChange={e =>
                      updateAttendance(student.id, { note: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvataggio...' : 'Registra Presenze'}
        </Button>
      </div>
    </div>
  )
}
