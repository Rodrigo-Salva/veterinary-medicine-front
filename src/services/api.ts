import axios from 'axios';
import type {
  Pet, PetCreate, PetUpdate,
  Owner, OwnerCreate,
  Appointment, AppointmentCreate,
  MedicalRecord, MedicalRecordCreate,
  Prescription, PrescriptionCreate,
  VaccineReminder,
  Attachment,
  Product, ProductCreate,
  Cage, Hospitalization, HospitalizationCreate, VitalSign, VitalSignCreate,
  Invoice, InvoiceCreate,
  AuthResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL as string;

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const petService = {
  getAll: async (): Promise<Pet[]> => (await api.get<Pet[]>('/pets/')).data,
  getById: async (id: string): Promise<Pet> => (await api.get<Pet>(`/pets/${id}`)).data,
  create: async (petData: PetCreate): Promise<Pet> => (await api.post<Pet>('/pets/', petData)).data,
  update: async (id: string, data: PetUpdate): Promise<Pet> => (await api.put<Pet>(`/pets/${id}`, data)).data,
  deactivate: async (id: string): Promise<Pet> => (await api.patch<Pet>(`/pets/${id}/deactivate`)).data,
};

export const ownerService = {
  getAll: async (): Promise<Owner[]> => (await api.get<Owner[]>('/owners/')).data,
  getById: async (id: string): Promise<Owner> => (await api.get<Owner>(`/owners/${id}`)).data,
  create: async (owner: OwnerCreate): Promise<Owner> => (await api.post<Owner>('/owners/', owner)).data,
};

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => (await api.get<Appointment[]>('/appointments/')).data,
  getByRange: async (start: string, end: string): Promise<Appointment[]> =>
    (await api.get<Appointment[]>('/appointments/range', { params: { start, end } })).data,
  getByPet: async (petId: string): Promise<Appointment[]> =>
    (await api.get<Appointment[]>(`/appointments/pet/${petId}`)).data,
  create: async (appointment: AppointmentCreate): Promise<Appointment> =>
    (await api.post<Appointment>('/appointments/', appointment)).data,
  update: async (id: string, data: AppointmentCreate): Promise<Appointment> =>
    (await api.put<Appointment>(`/appointments/${id}`, data)).data,
  updateStatus: async (id: string, status: string): Promise<Appointment> =>
    (await api.patch<Appointment>(`/appointments/${id}/status`, null, { params: { status } })).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/appointments/${id}`); },
};

export const hospitalService = {
  getCages: async (): Promise<Cage[]> => (await api.get<Cage[]>('/hospital/cages')).data,
  checkIn: async (data: HospitalizationCreate): Promise<Hospitalization> =>
    (await api.post<Hospitalization>('/hospital/check-in', data)).data,
  recordVitals: async (data: VitalSignCreate): Promise<VitalSign> =>
    (await api.post<VitalSign>('/hospital/vitals', data)).data,
  discharge: async (hospId: string): Promise<Hospitalization> =>
    (await api.post<Hospitalization>(`/hospital/discharge/${hospId}`)).data,
};

export const medicalService = {
  getHistory: async (petId: string): Promise<MedicalRecord[]> =>
    (await api.get<MedicalRecord[]>(`/medical-records/pet/${petId}`)).data,
  addRecord: async (data: MedicalRecordCreate): Promise<MedicalRecord> =>
    (await api.post<MedicalRecord>('/medical-records/', data)).data,
};

export const inventoryService = {
  getAll: async (): Promise<Product[]> => (await api.get<Product[]>('/inventory/')).data,
  create: async (product: ProductCreate): Promise<Product> =>
    (await api.post<Product>('/inventory/', product)).data,
  update: async (id: string, product: ProductCreate): Promise<Product> =>
    (await api.put<Product>(`/inventory/${id}`, product)).data,
  updateStock: async (id: string, quantity: number): Promise<Product> =>
    (await api.patch<Product>(`/inventory/${id}/stock`, { quantity })).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/inventory/${id}`); },
};

export const statsService = {
  getStats: async () => (await api.get('/stats/')).data,
  getMonthly: async () => (await api.get('/stats/monthly')).data,
  getSpecies: async () => (await api.get('/stats/species')).data,
  getTopOwners: async () => (await api.get('/stats/top-owners')).data,
};

export const prescriptionService = {
  getByPet: async (petId: string): Promise<Prescription[]> =>
    (await api.get<Prescription[]>(`/prescriptions/pet/${petId}`)).data,
  create: async (prescription: PrescriptionCreate): Promise<Prescription> =>
    (await api.post<Prescription>('/prescriptions/', prescription)).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/prescriptions/${id}`); },
};

export const vaccineService = {
  getUpcoming: async (days = 30): Promise<VaccineReminder[]> =>
    (await api.get<VaccineReminder[]>(`/vaccines/upcoming?days=${days}`)).data,
};

export const attachmentService = {
  getByPet: async (petId: string): Promise<Attachment[]> =>
    (await api.get<Attachment[]>(`/attachments/pet/${petId}`)).data,
  upload: async (
    petId: string,
    file: File,
    description?: string,
    medicalRecordId?: string,
  ): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('pet_id', petId);
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (medicalRecordId) formData.append('medical_record_id', medicalRecordId);
    return (
      await api.post<Attachment>('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  delete: async (id: string): Promise<void> => { await api.delete(`/attachments/${id}`); },
};

export const billingService = {
  getAll: async (status?: string): Promise<Invoice[]> =>
    (await api.get<Invoice[]>('/billing/', { params: status ? { status } : {} })).data,
  create: async (data: InvoiceCreate): Promise<Invoice> =>
    (await api.post<Invoice>('/billing/', data)).data,
  getById: async (id: string): Promise<Invoice> =>
    (await api.get<Invoice>(`/billing/${id}`)).data,
  updateStatus: async (id: string, status: string): Promise<{ id: string; status: string }> =>
    (await api.patch(`/billing/${id}/status`, null, { params: { status } })).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/billing/${id}`); },
};

export const searchService = {
  search: async (q: string) => (await api.get('/search/', { params: { q } })).data,
};

export const authService = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> =>
    (await api.post<AuthResponse>('/users/login', credentials)).data,
  getMe: async (): Promise<{ username: string; email: string; role: string }> =>
    (await api.get('/users/me')).data,
};

export default api;
