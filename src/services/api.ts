import axios from 'axios';
import { Pet, PetCreate, Product, ProductCreate, MedicalRecord, Prescription, PrescriptionCreate, VaccineReminder, Attachment, AuthResponse } from '../types';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const petService = {
  getAll: async (): Promise<Pet[]> => {
    const response = await api.get<Pet[]>('/pets/');
    return response.data;
  },
  getById: async (id: string): Promise<Pet> => {
    const response = await api.get<Pet>(`/pets/${id}`);
    return response.data;
  },
  create: async (petData: PetCreate): Promise<Pet> => {
    const response = await api.post<Pet>('/pets/', petData);
    return response.data;
  },
};

export const ownerService = {
  getAll: async () => {
    const response = await api.get('/owners/');
    return response.data;
  },
  create: async (owner: any) => {
    const response = await api.post('/owners/', owner);
    return response.data;
  },
};

export const appointmentService = {
  getAll: async () => {
    const response = await api.get('/appointments/');
    return response.data;
  },
  create: async (appointment: any) => {
    const response = await api.post('/appointments/', appointment);
    return response.data;
  },
};

export const hospitalService = {
  getCages: async () => {
    const response = await api.get('/hospital/cages');
    return response.data;
  },
  checkIn: async (data: any) => {
    const response = await api.post('/hospital/check-in', data);
    return response.data;
  },
  recordVitals: async (data: any) => {
    const response = await api.post('/hospital/vitals', data);
    return response.data;
  },
  discharge: async (hospId: string) => {
    const response = await api.post(`/hospital/discharge/${hospId}`);
    return response.data;
  },
};

export const medicalService = {
  getHistory: async (petId: string): Promise<MedicalRecord[]> => {
    const response = await api.get<MedicalRecord[]>(`/medical-records/pet/${petId}`);
    return response.data;
  },
  addRecord: async (data: any): Promise<MedicalRecord> => {
    const response = await api.post<MedicalRecord>('/medical-records/', data);
    return response.data;
  },
};

export const inventoryService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/inventory/');
    return response.data;
  },
  create: async (product: ProductCreate): Promise<Product> => {
    const response = await api.post<Product>('/inventory/', product);
    return response.data;
  },
  update: async (id: string, product: ProductCreate): Promise<Product> => {
    const response = await api.put<Product>(`/inventory/${id}`, product);
    return response.data;
  },
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    const response = await api.patch<Product>(`/inventory/${id}/stock`, { quantity });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
};

export const statsService = {
  getStats: async () => {
    const response = await api.get('/stats/');
    return response.data;
  },
};

export const prescriptionService = {
  getByPet: async (petId: string): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/prescriptions/pet/${petId}`);
    return response.data;
  },
  create: async (prescription: PrescriptionCreate): Promise<Prescription> => {
    const response = await api.post<Prescription>('/prescriptions/', prescription);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/prescriptions/${id}`);
  }
};

export const vaccineService = {
  getUpcoming: async (days: number = 30): Promise<VaccineReminder[]> => {
    const response = await api.get<VaccineReminder[]>(`/vaccines/upcoming?days=${days}`);
    return response.data;
  }
};

export const attachmentService = {
  getByPet: async (petId: string): Promise<Attachment[]> => {
    const response = await api.get<Attachment[]>(`/attachments/pet/${petId}`);
    return response.data;
  },
  upload: async (petId: string, file: File, description?: string, medicalRecordId?: string): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('pet_id', petId);
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (medicalRecordId) formData.append('medical_record_id', medicalRecordId);
    
    const response = await api.post<Attachment>('/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/attachments/${id}`);
  }
};

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/users/login', credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};

export default api;
