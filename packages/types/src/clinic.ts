export interface Clinic {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  services: string[];
  description?: string;
  ownerId: string;
  verified: boolean;
  createdAt: string;
}

export interface ClinicStats {
  totalGaps: number;
  activeGaps: number;
  totalBookings: number;
  confirmedBookings: number;
  monthlyBookings: number;
  revenueThisMonth: number;
  occupancyRate: number;
}

export interface UpdateClinicDto {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  photos?: string[];
  services?: string[];
  description?: string;
}
