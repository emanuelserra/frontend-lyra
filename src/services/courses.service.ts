import apiClient from '@/lib/utils/api-client';

export interface Course {
  id: number;
  name: string;
  duration_years: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseDto {
  name: string;
  duration_years: number;
}

export interface UpdateCourseDto {
  name?: string;
  duration_years?: number;
}

class CoursesService {
  async getAllCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses');
    return response.data;
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${id}`);
    return response.data;
  }

  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await apiClient.post<Course>('/courses', data);
    return response.data;
  }

  async updateCourse(id: number, data: UpdateCourseDto): Promise<Course> {
    const response = await apiClient.patch<Course>(`/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await apiClient.delete(`/courses/${id}`);
  }
}

export const coursesService = new CoursesService();
