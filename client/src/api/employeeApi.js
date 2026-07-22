import employeeAxios from './employeeAxios';

export const employeeApi = {
  register: async (employeeData) => {
    const { data } = await employeeAxios.post('/employee/register', employeeData);
    return data;
  },

  login: async (email, password) => {
    const { data } = await employeeAxios.post('/employee/login', { email, password });
    return data;
  },

  getMe: async () => {
    const { data } = await employeeAxios.get('/employee/me');
    return data;
  },

  getTodayAttendance: async () => {
    const { data } = await employeeAxios.get('/employee/attendance/today');
    return data;
  },

  checkIn: async (remarks) => {
    const { data } = await employeeAxios.post('/employee/attendance/checkin', { remarks });
    return data;
  },

  checkOut: async () => {
    const { data } = await employeeAxios.post('/employee/attendance/checkout');
    return data;
  },

  getDepartments: async () => {
    const { data } = await employeeAxios.get('/admin/departments');
    return data;
  }
};
