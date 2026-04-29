export type GapStatus = 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED';

export type ServiceType = 'FISIO' | 'MASAJE' | 'QUIRO' | 'OSTEO';

export interface Gap {
  id: string;
  clinicId: string;
  datetime: string;
  durationMins: number;
  service: ServiceType;
  stdPrice: number;
  discountPrice: number;
  maxBookings: number;
  status: GapStatus;
  createdAt: string;
}

export interface GapWithClinic extends Gap {
  clinic: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    photos: string[];
    verified: boolean;
  };
  distanceKm?: number;
  discountPct: number;
}

export interface CreateGapDto {
  datetime: string;
  durationMins: number;
  service: ServiceType;
  stdPrice: number;
  discountPrice: number;
  maxBookings?: number;
}

export interface UpdateGapDto {
  datetime?: string;
  durationMins?: number;
  stdPrice?: number;
  discountPrice?: number;
  status?: GapStatus;
}

export interface GapFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  type?: ServiceType;
  date?: string;
  page?: number;
  limit?: number;
}
