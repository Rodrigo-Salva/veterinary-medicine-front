// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface PermissionItem {
  module: string;
  action: string;
}

export interface User {
  username: string;
  email: string;
  role_id: string;
  role_name: string;
  is_active?: boolean;
  permissions: PermissionItem[];
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role_id: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ─── Roles & Permissions ─────────────────────────────────────────────────────

export interface Permission {
  id: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  permissions: Permission[];
}

export interface RoleCreate {
  name: string;
  description?: string;
}

// ─── Owner ────────────────────────────────────────────────────────────────────

export interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export type OwnerCreate = Omit<Owner, 'id'>;

// ─── Pet ──────────────────────────────────────────────────────────────────────

export interface WeightRecord {
  id: string;
  pet_id: string;
  weight: number;
  recorded_date: string;
  notes?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  owner_id: string;
  medical_history?: string;
  is_active: boolean;
  photo_url?: string;
  sex?: string;
  color?: string;
  weight?: number;
  allergies?: string;
  is_neutered: boolean;
  microchip?: string;
  birth_date?: string;
  notes?: string;
  weight_history?: WeightRecord[];
}

export interface PetCreate {
  name: string;
  species: string;
  breed: string;
  age: number;
  owner_id: string;
  sex?: string;
  color?: string;
  weight?: number;
  allergies?: string;
  is_neutered?: boolean;
  microchip?: string;
  birth_date?: string;
  notes?: string;
}

export interface PetUpdate {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  sex?: string;
  color?: string;
  weight?: number;
  allergies?: string;
  is_neutered?: boolean;
  microchip?: string;
  birth_date?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  pet_id: string;
  owner_id: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Success' | 'Failed';
  cost: number;
}

export type AppointmentCreate = Omit<Appointment, 'id' | 'status'>;

// ─── Medical Record ───────────────────────────────────────────────────────────

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

export interface MedicalRecordCreate {
  pet_id: string;
  description: string;
  diagnosis: string;
  treatment: string;
  record_type: string;
  next_date?: string | null;
}

// ─── Prescription ─────────────────────────────────────────────────────────────

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

// ─── Vaccine Reminder ─────────────────────────────────────────────────────────

export interface VaccineReminder {
  pet_id: string;
  pet_name: string;
  owner_name: string;
  record_type: string;
  next_date: string;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  pet_id: string;
  file_path: string;
  file_type: 'Image' | 'PDF' | 'Other';
  description?: string;
  category: string;
  upload_date: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

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

// ─── Hospital ─────────────────────────────────────────────────────────────────

export interface Cage {
  id: string;
  name: string;
  is_occupied: boolean;
  current_pet_id?: string;
}

export interface VitalSign {
  id: string;
  temperature: number;
  heart_rate: number;
  respiratory_rate: number;
  notes: string;
  timestamp: string;
}

export interface VitalSignCreate {
  hospitalization_id: string;
  temperature: number;
  heart_rate: number;
  respiratory_rate: number;
  notes: string;
}

export interface Hospitalization {
  id: string;
  pet_id: string;
  cage_id: string;
  reason: string;
  check_in_date: string;
  check_out_date?: string;
  status: string;
  vital_signs: VitalSign[];
}

export interface HospitalizationCreate {
  pet_id: string;
  cage_id: string;
  reason: string;
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceItemCreate {
  description: string;
  quantity?: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  pet_id: string;
  owner_id: string;
  date: string;
  subtotal: number;
  tax_rate: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  notes?: string;
  items: InvoiceItem[];
}

export interface InvoiceCreate {
  pet_id: string;
  owner_id: string;
  items: InvoiceItemCreate[];
  tax_rate?: number;
  notes?: string;
}
