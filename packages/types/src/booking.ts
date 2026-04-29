export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  gapId: string;
  userId: string;
  status: BookingStatus;
  note?: string;
  createdAt: string;
}

export interface BookingWithDetails extends Booking {
  gap: {
    id: string;
    datetime: string;
    durationMins: number;
    service: string;
    discountPrice: number;
    clinic: {
      id: string;
      name: string;
      address: string;
      photos: string[];
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateBookingDto {
  gapId: string;
  note?: string;
}

export interface UpdateBookingDto {
  status: BookingStatus;
}
