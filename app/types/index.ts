export interface Destination {
  id: string;
  name: string;
  province: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface TourPackage {
  id: string;
  name: string;
  destinationId: string;
  destinationName: string;
  durationDays: number;
  price: number;
  image: string;
  description: string;
  includes: string[];
}

export type UserRole = 'customer' | 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  travelDate: string;
  travelers: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
