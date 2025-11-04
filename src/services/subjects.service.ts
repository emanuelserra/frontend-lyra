import apiClient from '@/lib/utils/api-client';

export interface Subject {
  id: number;
  name: string;
  duration_hours: number;
  course_id: number;
  course?: {
    id: number;
    name: string;
    duration_years: number;
  };
  professors?: Professor[];
}

export interface Professor {
  id: number;
  user_id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateSubjectDto {
  name: string;
  duration_hours: number;
  course_id: number;
}

export interface UpdateSubjectDto {
  name?: string;
  duration_hours?: number;
  course_id?: number;
}

class SubjectsService {
  async getAllSubjects(): Promise<Subject[]> {
    const response = await apiClient.get<Subject[]>('/subjects');
    return response.data;
  }

  async getSubjectById(id: number): Promise<Subject> {
    const response = await apiClient.get<Subject>(`/subjects/${id}`);
    return response.data;
  }

  async createSubject(data: CreateSubjectDto): Promise<Subject> {
    const response = await apiClient.post<Subject>('/subjects', data);
    return response.data;
  }

  async updateSubject(id: number, data: UpdateSubjectDto): Promise<Subject> {
    const response = await apiClient.patch<Subject>(`/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: number): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
  }

  async assignProfessor(subjectId: number, professorId: number): Promise<Subject> {
    const response = await apiClient.post<Subject>(`/subjects/${subjectId}/professors/${professorId}`);
    return response.data;
  }

  async removeProfessor(subjectId: number, professorId: number): Promise<Subject> {
    const response = await apiClient.delete<Subject>(`/subjects/${subjectId}/professors/${professorId}`);
    return response.data;
  }
}

export const subjectsService = new SubjectsService();
