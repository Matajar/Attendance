import axios from 'axios';
import { Department, Designation, Employee, Attendance, MonthlyReport, DashboardStats } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const departmentAPI = {
  getAll: () => api.get<{ success: boolean; data: Department[] }>('/departments'),
  getById: (id: string) => api.get<{ success: boolean; data: Department }>(`/departments/${id}`),
  create: (data: Partial<Department>) => api.post<{ success: boolean; data: Department }>('/departments', data),
  update: (id: string, data: Partial<Department>) => api.put<{ success: boolean; data: Department }>(`/departments/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/departments/${id}`),
};

export const designationAPI = {
  getAll: () => api.get<{ success: boolean; data: Designation[] }>('/designations'),
  getById: (id: string) => api.get<{ success: boolean; data: Designation }>(`/designations/${id}`),
  create: (data: Partial<Designation>) => api.post<{ success: boolean; data: Designation }>('/designations', data),
  update: (id: string, data: Partial<Designation>) => api.put<{ success: boolean; data: Designation }>(`/designations/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/designations/${id}`),
};

export const employeeAPI = {
  getAll: (params?: { department?: string; designation?: string }) =>
    api.get<{ success: boolean; data: Employee[] }>('/employees', { params }),
  getById: (id: string) => api.get<{ success: boolean; data: Employee }>(`/employees/${id}`),
  create: (data: Partial<Employee>) => api.post<{ success: boolean; data: Employee }>('/employees', data),
  update: (id: string, data: Partial<Employee>) => api.put<{ success: boolean; data: Employee }>(`/employees/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/employees/${id}`),
};

export const attendanceAPI = {
  markAttendance: (data: {
    employeeId: string;
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    remarks?: string;
  }) => api.post<{ success: boolean; data: Attendance }>('/attendance/mark', data),

  getByDate: (date: string) =>
    api.get<{ success: boolean; data: Attendance[] }>(`/attendance/date/${date}`),

  getEmployeeAttendance: (employeeId: string, startDate?: string, endDate?: string) =>
    api.get<{ success: boolean; data: Attendance[] }>(`/attendance/employee/${employeeId}`, {
      params: { startDate, endDate },
    }),

  getMonthlyReport: (employeeId: string, year: number, month: number) =>
    api.get<{ success: boolean; data: MonthlyReport }>(`/attendance/report/${employeeId}/${year}/${month}`),

  getDashboardStats: () =>
    api.get<{ success: boolean; data: DashboardStats }>('/attendance/dashboard'),
};

export default api;