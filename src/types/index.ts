export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  owner_id: string;
  medical_history?: string;
}

export interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export type OwnerCreate = Omit<Owner, 'id'>;

export type PetCreate = Omit<Pet, 'id' | 'medical_history'>;

export interface Product {
  id: string;
  name: string;
  description?: string;
  purchase_price: number;
  sale_price: number;
  stock: number;
  category: string;
}

export type ProductCreate = Omit<Product, 'id'>;

export interface MedicalRecord {
  id: string;
  pet_id: string;
  recording_date: string;
  description: string;
  diagnosis: string;
  treatment: string;
  record_type: string;
  next_date?: string;
  vet_id?: string;
}

export interface Prescription {
  id: string;
  pet_id: string;
  medical_record_id?: string;
  date: string;
  medications: string;
  instructions: string;
}

export interface PrescriptionCreate {
  pet_id: string;
  medications: string;
  instructions: string;
  medical_record_id?: string;
}

export interface VaccineReminder {
  pet_id: string;
  pet_name: string;
  owner_name: string;
  record_type: string;
  next_date: string;
}

export interface Attachment {
  id: string;
  pet_id: string;
  file_path: string;
  file_type: 'Image' | 'PDF' | 'Other';
  description?: string;
  upload_date: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  owner_id: string;
  date: string;
  reason: string;
  status?: string;
  cost: number;
}

export type AppointmentCreate = Omit<Appointment, 'id'>;

export interface MedicalRecordCreate {
  pet_id: string;
  description: string;
  diagnosis: string;
  treatment: string;
  record_type: string;
  next_date?: string | null;
}

export interface User {
  username: string;
  email: string;
  role: 'Admin' | 'Vet' | 'Receptionist';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
