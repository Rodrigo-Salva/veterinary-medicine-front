import axios from 'axios';
import { Pet, PetCreate, Product, ProductCreate, MedicalRecord, Prescription, PrescriptionCreate, VaccineReminder, Attachment, AuthResponse } from '../types';

const API_URL = 'http://localhost:8001';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const petService = {
  getAll: async (): Promise<Pet[]> => (await api.get<Pet[]>('/pets/')).data,
  getById: async (id: string): Promise<Pet> => (await api.get<Pet>(`/pets/${id}`)).data,
  create: async (petData: PetCreate): Promise<Pet> => (await api.post<Pet>('/pets/', petData)).data,
};

export const ownerService = {
  getAll: async () => (await api.get('/owners/')).data,
  create: async (owner: any) => (await api.post('/owners/', owner)).data,
};

export const appointmentService = {
  getAll: async () => (await api.get('/appointments/')).data,
  getByRange: async (start: string, end: string) => (await api.get('/appointments/range', { params: { start, end } })).data,
  create: async (appointment: any) => (await api.post('/appointments/', appointment)).data,
  update: async (id: string, data: any) => (await api.put(`/appointments/${id}`, data)).data,
  updateStatus: async (id: string, status: string) => (await api.patch(`/appointments/${id}/status`, null, { params: { status } })).data,
  delete: async (id: string) => { await api.delete(`/appointments/${id}`); },
};

export const hospitalService = {
  getCages: async () => (await api.get('/hospital/cages')).data,
  checkIn: async (data: any) => (await api.post('/hospital/check-in', data)).data,
  recordVitals: async (data: any) => (await api.post('/hospital/vitals', data)).data,
  discharge: async (hospId: string) => (await api.post(`/hospital/discharge/${hospId}`)).data,
};

export const medicalService = {
  getHistory: async (petId: string): Promise<MedicalRecord[]> => (await api.get<MedicalRecord[]>(`/medical-records/pet/${petId}`)).data,
  addRecord: async (data: any): Promise<MedicalRecord> => (await api.post<MedicalRecord>('/medical-records/', data)).data,
};

export const inventoryService = {
  getAll: async (): Promise<Product[]> => (await api.get<Product[]>('/inventory/')).data,
  create: async (product: ProductCreate): Promise<Product> => (await api.post<Product>('/inventory/', product)).data,
  update: async (id: string, product: ProductCreate): Promise<Product> => (await api.put<Product>(`/inventory/${id}`, product)).data,
  updateStock: async (id: string, quantity: number): Promise<Product> => (await api.patch<Product>(`/inventory/${id}/stock`, { quantity })).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/inventory/${id}`); },
};

export const statsService = {
  getStats: async () => (await api.get('/stats/')).data,
  getMonthly: async () => (await api.get('/stats/monthly')).data,
  getSpecies: async () => (await api.get('/stats/species')).data,
  getTopOwners: async () => (await api.get('/stats/top-owners')).data,
};

export const prescriptionService = {
  getByPet: async (petId: string): Promise<Prescription[]> => (await api.get<Prescription[]>(`/prescriptions/pet/${petId}`)).data,
  create: async (prescription: PrescriptionCreate): Promise<Prescription> => (await api.post<Prescription>('/prescriptions/', prescription)).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/prescriptions/${id}`); },
};

export const vaccineService = {
  getUpcoming: async (days: number = 30): Promise<VaccineReminder[]> => (await api.get<VaccineReminder[]>(`/vaccines/upcoming?days=${days}`)).data,
};

export const attachmentService = {
  getByPet: async (petId: string): Promise<Attachment[]> => (await api.get<Attachment[]>(`/attachments/pet/${petId}`)).data,
  upload: async (petId: string, file: File, description?: string, medicalRecordId?: string): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('pet_id', petId);
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (medicalRecordId) formData.append('medical_record_id', medicalRecordId);
    return (await api.post<Attachment>('/attachments/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  delete: async (id: string): Promise<void> => { await api.delete(`/attachments/${id}`); },
};

export const billingService = {
  getAll: async (status?: string) => (await api.get('/billing/', { params: status ? { status } : {} })).data,
  create: async (data: any) => (await api.post('/billing/', data)).data,
  getById: async (id: string) => (await api.get(`/billing/${id}`)).data,
  updateStatus: async (id: string, status: string) => (await api.patch(`/billing/${id}/status`, null, { params: { status } })).data,
  delete: async (id: string) => { await api.delete(`/billing/${id}`); },
};

export const searchService = {
  search: async (q: string) => (await api.get('/search/', { params: { q } })).data,
};

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => (await api.post<AuthResponse>('/users/login', credentials)).data,
  getMe: async () => (await api.get('/users/me')).data,
};

export default api;
