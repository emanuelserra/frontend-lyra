import apiClient from '@/lib/utils/api-client';

export interface Student {
  id: number;
  user_id: number;
  course_id: number;
  enrollment_number: string;
  enrollment_year: number;
  status: 'active' | 'graduated' | 'retired';
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    birth_date?: string;
  };
  course?: {
    id: number;
    name: string;
    duration_years: number;
  };
}

export interface CreateStudentDto {
  user_id: number;
  course_id: number;
  enrollment_year: number;
  enrollment_number: string;
}

export interface UpdateStudentDto {
  course_id?: number;
  enrollment_year?: number;
  enrollment_number?: string;
  status?: 'active' | 'graduated' | 'retired';
}

class StudentsService {
  async getAllStudents(): Promise<Student[]> {
    const response = await apiClient.get<Student[]>('/students');
    return response.data;
  }

  async getStudentById(id: number): Promise<Student> {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data;
  }

  async getMyProfile(): Promise<Student> {
    const response = await apiClient.get<Student>('/students/me');
    return response.data;
  }

  async getMyAttendances(): Promise<any[]> {
    const response = await apiClient.get('/students/me/attendances');
    return response.data;
  }

  async getMyGrades(): Promise<any[]> {
    const response = await apiClient.get('/students/me/grades');
    return response.data;
  }

  async createStudent(data: CreateStudentDto): Promise<Student> {
    const response = await apiClient.post<Student>('/students', data);
    return response.data;
  }

  async updateStudent(id: number, data: UpdateStudentDto): Promise<Student> {
    const response = await apiClient.patch<Student>(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  }
}

export const studentsService = new StudentsService();
