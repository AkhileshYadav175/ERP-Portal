import axiosInstance from './axios';

export const certificateApi = {
  createCertificate: async (certificateData) => {
    const { data } = await axiosInstance.post('/certificates', certificateData);
    return data;
  },

  getCertificates: async () => {
    const { data } = await axiosInstance.get('/certificates');
    return data;
  },

  updateCertificate: async (id, certificateData) => {
    const { data } = await axiosInstance.put(`/certificates/${id}`, certificateData);
    return data;
  },

  deleteCertificate: async (id) => {
    const { data } = await axiosInstance.delete(`/certificates/${id}`);
    return data;
  },

  verifyCertificate: async (enrollmentNumber) => {
    const { data } = await axiosInstance.get('/certificates/verify', {
      params: { enrollmentNumber }
    });
    return data;
  }
};
