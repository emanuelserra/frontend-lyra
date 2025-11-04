import apiClient from '@/lib/utils/api-client';

export interface Professor {
  id: number;
  user_id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    birth_date?: string;
  };
  subjects?: Subject[];
  courses?: Course[];
}

export interface Subject {
  id: number;
  name: string;
  duration_hours: number;
  course_id: number;
}

export interface Course {
  id: number;
  name: string;
  duration_years: number;
}

export interface Lesson {
  id: number;
  subject_id: number;
  professor_id: number;
  course_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  subject?: Subject;
  course?: Course;
}

export interface CreateProfessorDto {
  user_id: number;
}

export interface UpdateProfessorDto {
  user_id?: number;
}

class ProfessorsService {
  async getAllProfessors(): Promise<Professor[]> {
    const response = await apiClient.get<Professor[]>('/professors');
    return response.data;
  }

  async getProfessorById(id: number): Promise<Professor> {
    const response = await apiClient.get<Professor>(`/professors/${id}`);
    return response.data;
  }

  async getMyProfile(): Promise<Professor> {
    const response = await apiClient.get<Professor>('/professors/me');
    return response.data;
  }

  async getMyLessons(): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>('/professors/me/lessons');
    return response.data;
  }

  async getMySubjects(): Promise<Subject[]> {
    const response = await apiClient.get<Subject[]>('/professors/me/subjects');
    return response.data;
  }

  async createProfessor(data: CreateProfessorDto): Promise<Professor> {
    const response = await apiClient.post<Professor>('/professors', data);
    return response.data;
  }

  async updateProfessor(id: number, data: UpdateProfessorDto): Promise<Professor> {
    const response = await apiClient.patch<Professor>(`/professors/${id}`, data);
    return response.data;
  }

  async deleteProfessor(id: number): Promise<void> {
    await apiClient.delete(`/professors/${id}`);
  }

  async assignCourse(professorId: number, courseId: number): Promise<Professor> {
    const response = await apiClient.post<Professor>(`/professors/${professorId}/courses/${courseId}`);
    return response.data;
  }

  async removeCourse(professorId: number, courseId: number): Promise<Professor> {
    const response = await apiClient.delete<Professor>(`/professors/${professorId}/courses/${courseId}`);
    return response.data;
  }
}

export const professorsService = new ProfessorsService();
