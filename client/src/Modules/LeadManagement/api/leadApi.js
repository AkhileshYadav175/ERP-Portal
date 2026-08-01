import axiosInstance from '../../../api/axios';

const leadAxios = axiosInstance;

export const leadApi = {
  getLeads: async () => {
    const response = await leadAxios.get('/lead');
    return response.data;
  },

  updateLeadStatus: async (leadId, status) => {
    const response = await leadAxios.put(`/lead/${leadId}`, { status });
    return response.data;
  },

  deleteLead: async (leadId) => {
    const response = await leadAxios.delete(`/lead/${leadId}`);
    return response.data;
  },

  createLead: async (leadData) => {
    const response = await leadAxios.post('/lead', leadData);
    return response.data;
  },

  createOfflineLead: async (leadData) => {
    const response = await leadAxios.post('/lead/offline', leadData);
    return response.data;
  },

  updateLead: async (leadId, leadData) => {
    const response = await leadAxios.put(`/lead/${leadId}`, leadData);
    return response.data;
  }
};
