import apiClient from '@/lib/utils/api-client';

export interface Lesson {
  id: number;
  subject_id: number;
  professor_id?: number;
  course_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  subject?: {
    id: number;
    name: string;
    duration_hours: number;
  };
  professor?: {
    id: number;
    user?: {
      first_name: string;
      last_name: string;
    };
  };
  course?: {
    id: number;
    name: string;
  };
}

export interface CreateLessonDto {
  subject_id: number;
  course_id: number;
  professor_id?: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
}

export interface UpdateLessonDto {
  subject_id?: number;
  professor_id?: number;
  lesson_date?: string;
  start_time?: string;
  end_time?: string;
}

class LessonsService {
  async getAllLessons(): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>('/lessons');
    return response.data;
  }

  async getLessonById(id: number): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/lessons/${id}`);
    return response.data;
  }

  async createLesson(data: CreateLessonDto): Promise<Lesson> {
    const response = await apiClient.post<Lesson>('/lessons', data);
    return response.data;
  }

  async updateLesson(id: number, data: UpdateLessonDto): Promise<Lesson> {
    const response = await apiClient.patch<Lesson>(`/lessons/${id}`, data);
    return response.data;
  }

  async deleteLesson(id: number): Promise<void> {
    await apiClient.delete(`/lessons/${id}`);
  }
}

export const lessonsService = new LessonsService();
