import apiClient from '@/lib/utils/api-client'
import type { Lesson } from './lessons.service'

export interface DashboardStats {
  studentsCount: number
  coursesCount: number
  professorsCount: number
  lessonsCount: number
}

export interface UpcomingLesson {
  id: number
  subject: string
  date: string
  startTime: string
  endTime: string
  professor?: string
  course?: string
}

export interface DashboardAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  count?: number
  href?: string
}

export interface RecentActivity {
  id: string
  type: string
  message: string
  timestamp: string
  user?: string
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats')
    return response.data
  }

  async getUpcomingLessons(limit: number = 5): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>('/dashboard/upcoming-lessons', {
      params: { limit }
    })
    return response.data
  }

  async getAlerts(): Promise<DashboardAlert[]> {
    const response = await apiClient.get<DashboardAlert[]>('/dashboard/alerts')
    return response.data
  }

  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get<RecentActivity[]>('/dashboard/activities', {
      params: { limit }
    })
    return response.data
  }
}

export const dashboardService = new DashboardService()
