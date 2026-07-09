import api from '@/services/axios';

export async function getAdminStats() {
  const res = await api.get('/admin/stats');
  return res.data.data;
}

export async function getAdminUsers(search = '', page = 1) {
  const res = await api.get(`/admin/users?search=${search}&page=${page}`);
  return res.data.data;
}

export async function getUserTimeline(userId: string) {
  const res = await api.get(`/admin/users/${userId}/timeline`);
  return res.data.data;
}

export async function updateUserPlanLimits(userId: string, data: any) {
  const res = await api.put(`/admin/users/${userId}/limits`, data);
  return res.data.data;
}

export async function getAIConfig() {
  const res = await api.get('/admin/ai/config');
  return res.data.data;
}

export async function updateAIConfig(data: any) {
  const res = await api.put('/admin/ai/config', data);
  return res.data.data;
}

export async function getSupportTickets() {
  const res = await api.get('/admin/tickets');
  return res.data.data;
}

export async function updateSupportTicket(ticketId: string, data: any) {
  const res = await api.put(`/admin/tickets/${ticketId}`, data);
  return res.data.data;
}

export async function getAuditLogs(search = '') {
  const res = await api.get(`/admin/audit?search=${search}`);
  return res.data.data;
}
