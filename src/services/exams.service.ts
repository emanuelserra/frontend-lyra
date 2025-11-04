import apiClient from '@/lib/utils/api-client';

export interface ExamSession {
  id: number;
  subject_id: number;
  course_id: number;
  professor_id?: number;
  exam_date: string;
  exam_time?: string;
  subject?: {
    id: number;
    name: string;
  };
  course?: {
    id: number;
    name: string;
  };
}

export interface ExamResult {
  id: number;
  exam_session_id: number;
  student_id: number;
  grade?: number;
  passed: boolean;
  exam_session?: ExamSession;
  student?: {
    id: number;
    enrollment_number: string;
    user?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface CreateExamSessionDto {
  subject_id: number;
  course_id: number;
  professor_id?: number;
  exam_date: string;
  exam_time?: string;
}

export interface CreateExamResultDto {
  exam_session_id: number;
  student_id: number;
  grade?: number;
  passed: boolean;
}

class ExamsService {
  // Exam Sessions
  async getAllExamSessions(): Promise<ExamSession[]> {
    const response = await apiClient.get<ExamSession[]>('/exam-sessions');
    return response.data;
  }

  async getExamSessionById(id: number): Promise<ExamSession> {
    const response = await apiClient.get<ExamSession>(`/exam-sessions/${id}`);
    return response.data;
  }

  async createExamSession(data: CreateExamSessionDto): Promise<ExamSession> {
    const response = await apiClient.post<ExamSession>('/exam-sessions', data);
    return response.data;
  }

  async updateExamSession(id: number, data: Partial<CreateExamSessionDto>): Promise<ExamSession> {
    const response = await apiClient.patch<ExamSession>(`/exam-sessions/${id}`, data);
    return response.data;
  }

  async deleteExamSession(id: number): Promise<void> {
    await apiClient.delete(`/exam-sessions/${id}`);
  }

  // Exam Results
  async getAllExamResults(): Promise<ExamResult[]> {
    const response = await apiClient.get<ExamResult[]>('/exam-results');
    return response.data;
  }

  async getExamResultById(id: number): Promise<ExamResult> {
    const response = await apiClient.get<ExamResult>(`/exam-results/${id}`);
    return response.data;
  }

  async getExamResultsByStudent(studentId: number): Promise<ExamResult[]> {
    const response = await apiClient.get<ExamResult[]>(`/exam-results/student/${studentId}`);
    return response.data;
  }

  async createExamResult(data: CreateExamResultDto): Promise<ExamResult> {
    const response = await apiClient.post<ExamResult>('/exam-results', data);
    return response.data;
  }

  async updateExamResult(id: number, data: Partial<CreateExamResultDto>): Promise<ExamResult> {
    const response = await apiClient.patch<ExamResult>(`/exam-results/${id}`, data);
    return response.data;
  }

  async deleteExamResult(id: number): Promise<void> {
    await apiClient.delete(`/exam-results/${id}`);
  }
}

export const examsService = new ExamsService();
