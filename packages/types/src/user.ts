export type UserRole = 'PATIENT' | 'CLINIC_OWNER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  lat?: number;
  lng?: number;
  pushToken?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface RegisterPatientDto {
  email: string;
  password: string;
  name: string;
}

export interface RegisterClinicDto {
  email: string;
  password: string;
  name: string;
  clinicName: string;
  address: string;
  lat: number;
  lng: number;
  services: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
