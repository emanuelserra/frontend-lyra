import apiClient from '@/lib/utils/api-client';

export interface Attendance {
  id: number;
  lesson_id: number;
  student_id: number;
  status: 'present' | 'absent' | 'late' | 'early_exit';
  justified: boolean;
  confirmed: boolean;
  note?: string;
  lesson?: {
    id: number;
    lesson_date: string;
    start_time: string;
    end_time: string;
    subject?: {
      id: number;
      name: string;
    };
  };
  student?: {
    id: number;
    enrollment_number: string;
    user?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface CreateAttendanceDto {
  lesson_id: number;
  student_id: number;
  status: 'present' | 'absent' | 'late' | 'early_exit';
  justified?: boolean;
  note?: string;
}

export interface UpdateAttendanceDto {
  status?: 'present' | 'absent' | 'late' | 'early_exit';
  justified?: boolean;
  note?: string;
}

class AttendanceService {
  async getAllAttendances(): Promise<Attendance[]> {
    const response = await apiClient.get<Attendance[]>('/attendances');
    return response.data;
  }

  async getAttendanceById(id: number): Promise<Attendance> {
    const response = await apiClient.get<Attendance>(`/attendances/${id}`);
    return response.data;
  }

  async getAttendancesByLesson(lessonId: number): Promise<Attendance[]> {
    const response = await apiClient.get<Attendance[]>(`/attendances/lesson/${lessonId}`);
    return response.data;
  }

  async getAttendancesByStudent(studentId: number): Promise<Attendance[]> {
    const response = await apiClient.get<Attendance[]>(`/attendances/student/${studentId}`);
    return response.data;
  }

  async createAttendance(data: CreateAttendanceDto): Promise<Attendance> {
    const response = await apiClient.post<Attendance>('/attendances', data);
    return response.data;
  }

  async updateAttendance(id: number, data: UpdateAttendanceDto): Promise<Attendance> {
    const response = await apiClient.patch<Attendance>(`/attendances/${id}`, data);
    return response.data;
  }

  async deleteAttendance(id: number): Promise<void> {
    await apiClient.delete(`/attendances/${id}`);
  }

  async selfMarkAttendance(lessonId: number, status: 'present' | 'late' | 'early_exit'): Promise<void> {
    await apiClient.post('/attendances/self-mark', {
      lesson_id: lessonId,
      status,
    });
  }

  async confirmAttendance(id: number): Promise<void> {
    await apiClient.patch(`/attendances/${id}/confirm`);
  }
}

export const attendanceService = new AttendanceService();
