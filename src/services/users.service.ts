import apiClient from '@/lib/utils/api-client';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  role: 'admin' | 'professor' | 'tutor' | 'student';
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  birth_date?: string;
  role: 'admin' | 'professor' | 'tutor' | 'student';
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  birth_date?: string;
  role?: 'admin' | 'professor' | 'tutor' | 'student';
}

class UsersService {
  async getRoles(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/users/roles');
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
}

export const usersService = new UsersService();
