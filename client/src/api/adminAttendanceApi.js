import axiosInstance from './axios';

export const adminAttendanceApi = {
  getPendingApprovals: async () => {
    const { data } = await axiosInstance.get('/admin/employees/pending');
    return data;
  },

  approveEmployee: async (id) => {
    const { data } = await axiosInstance.post(`/admin/employees/${id}/approve`);
    return data;
  },

  rejectEmployee: async (id) => {
    const { data } = await axiosInstance.post(`/admin/employees/${id}/reject`);
    return data;
  },

  getDailySummary: async () => {
    const { data } = await axiosInstance.get('/admin/attendance/summary');
    return data;
  },

  getAttendanceStats: async () => {
    const { data } = await axiosInstance.get('/admin/attendance/stats');
    return data;
  },

  createEmployee: async (employeeData) => {
    const { data } = await axiosInstance.post('/admin/employees/create', employeeData);
    return data;
  },

  getActiveEmployees: async () => {
    const { data } = await axiosInstance.get('/admin/employees');
    return data;
  }
};
