// ============================================================
// PataNyumba – Type Definitions
// ============================================================

export type UserRole = "admin" | "landlord" | "client";
export type UserStatus = "active" | "suspended";
export type PropertyStatus = "pending" | "approved" | "rejected" | "hidden";
export type Availability = "Available" | "Rented" | "Coming Soon";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  county: string;
  town: string;
  estate: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  deposit: number;
  amenities: string[];
  availability: Availability;
  status: PropertyStatus;
  images: string[];
  views: number;
  inquiries: number;
  whatsappClicks: number;
  createdAt: string;
  verified: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface AppSettings {
  currency: "KES" | "USD";
  theme: "light" | "dark";
  logo: string;
}

export interface Session {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export const PROPERTY_TYPES = [
  "Bedsitter",
  "Single Room",
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "Maisonette",
  "Bungalow",
  "Apartment",
  "Hostel",
  "Office",
  "Shop",
  "Warehouse",
  "Commercial",
  "Land",
] as const;

export const KENYAN_COUNTIES = [
  "Nairobi",
  "Kiambu",
  "Kisumu",
  "Mombasa",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Meru",
  "Nyeri",
] as const;

export const AMENITY_OPTIONS = [
  "Water",
  "Parking",
  "Internet",
  "Security",
  "Furnished",
  "Pets",
  "Garden",
  "Pool",
  "Gym",
  "Borehole",
  "Solar",
  "Backup Generator",
] as const;
