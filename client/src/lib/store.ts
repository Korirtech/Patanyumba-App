// ============================================================
// PataNyumba – Data Store (localStorage-based)
// ============================================================

import type {
  User,
  Property,
  Favorite,
  Inquiry,
  AppSettings,
  Session,
} from "./types";

const STORAGE_KEYS = {
  users: "pata_users",
  properties: "pata_properties",
  favorites: "pata_favorites",
  inquiries: "pata_inquiries",
  settings: "pata_settings",
  session: "pata_session",
} as const;

// --- Generic helpers ---
function getData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setData<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- Seed data ---
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop";

function seedData() {
  if (!getData(STORAGE_KEYS.users)) {
    const users: User[] = [
      {
        id: "admin1",
        name: "Super Admin",
        email: "iamkorir200@gmail.com",
        phone: "0712345678",
        password: "123456",
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "land1",
        name: "John Landlord",
        email: "john@landlord.com",
        phone: "0722334455",
        password: "land123",
        role: "landlord",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "client1",
        name: "Jane Client",
        email: "jane@client.com",
        phone: "0733445566",
        password: "client123",
        role: "client",
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];
    setData(STORAGE_KEYS.users, users);
  }

  if (!getData(STORAGE_KEYS.properties)) {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    const props: Property[] = [
      {
        id: "p1",
        landlordId: "land1",
        title: "Modern 3BR Apartment in Kilimani",
        description:
          "A stunning modern apartment with great views, ample parking, and secure estate. Recently renovated with contemporary finishes and located in the heart of Kilimani.",
        county: "Nairobi",
        town: "Kilimani",
        estate: "Valley Arcade",
        address: "Off Ngong Road",
        lat: -1.2921,
        lng: 36.8219,
        type: "Apartment",
        bedrooms: 3,
        bathrooms: 2,
        price: 75000,
        deposit: 150000,
        amenities: ["Water", "Parking", "Internet", "Security", "Furnished"],
        availability: "Available",
        status: "approved",
        images: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
        ],
        views: 142,
        inquiries: 8,
        whatsappClicks: 12,
        createdAt: new Date(now - day * 3).toISOString(),
        verified: true,
      },
      {
        id: "p2",
        landlordId: "land1",
        title: "Cozy Bedsitter in Westlands",
        description:
          "Perfect for singles or students, close to shopping malls and public transport. Compact but well-designed with modern amenities.",
        county: "Nairobi",
        town: "Westlands",
        estate: "Parklands",
        address: "Parklands Road",
        lat: -1.2667,
        lng: 36.8033,
        type: "Bedsitter",
        bedrooms: 1,
        bathrooms: 1,
        price: 18000,
        deposit: 36000,
        amenities: ["Water", "Security", "Internet"],
        availability: "Available",
        status: "approved",
        images: [
          "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=800&fit=crop",
        ],
        views: 89,
        inquiries: 3,
        whatsappClicks: 5,
        createdAt: new Date(now - day * 7).toISOString(),
        verified: false,
      },
      {
        id: "p3",
        landlordId: "land1",
        title: "Spacious 2BR in Kileleshwa",
        description:
          "Beautifully furnished 2-bedroom with a garden and parking. Bright and airy living spaces with modern kitchen fittings.",
        county: "Nairobi",
        town: "Kileleshwa",
        estate: "Kileleshwa Estate",
        address: "Ring Road",
        lat: -1.289,
        lng: 36.773,
        type: "Apartment",
        bedrooms: 2,
        bathrooms: 1,
        price: 45000,
        deposit: 90000,
        amenities: ["Water", "Parking", "Security", "Pets"],
        availability: "Available",
        status: "pending",
        images: [
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop",
        ],
        views: 34,
        inquiries: 1,
        whatsappClicks: 2,
        createdAt: new Date(now - day * 1).toISOString(),
        verified: false,
      },
      {
        id: "p4",
        landlordId: "land1",
        title: "Modern Maisonette in Runda",
        description:
          "Luxury 4-bedroom maisonette with a private pool and large compound. Premium finishes throughout with a modern kitchen and spacious living areas.",
        county: "Kiambu",
        town: "Runda",
        estate: "Runda Estate",
        address: "Runda Drive",
        lat: -1.225,
        lng: 36.802,
        type: "Maisonette",
        bedrooms: 4,
        bathrooms: 3,
        price: 180000,
        deposit: 360000,
        amenities: ["Water", "Parking", "Security", "Internet", "Furnished", "Pets"],
        availability: "Available",
        status: "approved",
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
        ],
        views: 205,
        inquiries: 14,
        whatsappClicks: 22,
        createdAt: new Date(now - day * 14).toISOString(),
        verified: true,
      },
      {
        id: "p5",
        landlordId: "land1",
        title: "Affordable Single Room in Kawangware",
        description:
          "Budget-friendly single room with shared amenities. Clean, secure, and close to public transport.",
        county: "Nairobi",
        town: "Kawangware",
        estate: "Kawangware",
        address: "Kawangware Road",
        lat: -1.289,
        lng: 36.751,
        type: "Single Room",
        bedrooms: 1,
        bathrooms: 1,
        price: 8000,
        deposit: 16000,
        amenities: ["Water", "Security"],
        availability: "Available",
        status: "rejected",
        images: [PLACEHOLDER_IMG],
        views: 23,
        inquiries: 0,
        whatsappClicks: 1,
        createdAt: new Date(now - day * 21).toISOString(),
        verified: false,
      },
      {
        id: "p6",
        landlordId: "land1",
        title: "Studio Apartment in Kilimani",
        description:
          "Modern studio with great city views. Open-plan layout with a sleek kitchenette and bathroom.",
        county: "Nairobi",
        town: "Kilimani",
        estate: "Kilimani Estate",
        address: "Elgeyo Road",
        lat: -1.29,
        lng: 36.82,
        type: "Studio",
        bedrooms: 1,
        bathrooms: 1,
        price: 28000,
        deposit: 56000,
        amenities: ["Water", "Internet", "Security", "Furnished"],
        availability: "Available",
        status: "approved",
        images: [
          "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&h=400&fit=crop",
        ],
        views: 67,
        inquiries: 4,
        whatsappClicks: 7,
        createdAt: new Date(now - day * 5).toISOString(),
        verified: true,
      },
    ];
    setData(STORAGE_KEYS.properties, props);
  }

  if (!getData(STORAGE_KEYS.favorites)) {
    setData<Favorite[]>(STORAGE_KEYS.favorites, []);
  }
  if (!getData(STORAGE_KEYS.inquiries)) {
    setData<Inquiry[]>(STORAGE_KEYS.inquiries, []);
  }
  if (!getData(STORAGE_KEYS.settings)) {
    const settings: AppSettings = {
      currency: "KES",
      theme: "light",
      logo: "",
    };
    setData(STORAGE_KEYS.settings, settings);
  }
}

// Ensure seed data is initialized immediately (synchronous)
// This runs at module load time, before any React component renders
seedData();

export function initStore() {
  seedData();
}

// --- Users ---
export function getUsers(): User[] {
  return getData<User[]>(STORAGE_KEYS.users) || [];
}
export function saveUsers(users: User[]): void {
  setData(STORAGE_KEYS.users, users);
}
export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

// --- Properties ---
export function getProperties(): Property[] {
  return getData<Property[]>(STORAGE_KEYS.properties) || [];
}
export function saveProperties(props: Property[]): void {
  setData(STORAGE_KEYS.properties, props);
}
export function getPropertyById(id: string): Property | undefined {
  return getProperties().find((p) => p.id === id);
}
export function getPropertiesByLandlord(landlordId: string): Property[] {
  return getProperties().filter((p) => p.landlordId === landlordId);
}
export function getApprovedProperties(): Property[] {
  return getProperties().filter((p) => p.status === "approved");
}

// --- Favorites ---
export function getFavorites(): Favorite[] {
  return getData<Favorite[]>(STORAGE_KEYS.favorites) || [];
}
export function saveFavorites(favs: Favorite[]): void {
  setData(STORAGE_KEYS.favorites, favs);
}
export function isFavorite(userId: string, propertyId: string): boolean {
  return getFavorites().some(
    (f) => f.userId === userId && f.propertyId === propertyId
  );
}
export function toggleFavorite(userId: string, propertyId: string): boolean {
  const favs = getFavorites();
  const existing = favs.find(
    (f) => f.userId === userId && f.propertyId === propertyId
  );
  if (existing) {
    saveFavorites(favs.filter((f) => f.id !== existing.id));
    return false;
  } else {
    favs.push({
      id: generateId(),
      userId,
      propertyId,
      createdAt: new Date().toISOString(),
    });
    saveFavorites(favs);
    return true;
  }
}
export function getUserFavorites(userId: string): Property[] {
  const favs = getFavorites().filter((f) => f.userId === userId);
  return favs
    .map((f) => getPropertyById(f.propertyId))
    .filter((p): p is Property => p !== undefined);
}

// --- Inquiries ---
export function getInquiries(): Inquiry[] {
  return getData<Inquiry[]>(STORAGE_KEYS.inquiries) || [];
}
export function saveInquiries(inquiries: Inquiry[]): void {
  setData(STORAGE_KEYS.inquiries, inquiries);
}
export function addInquiry(inquiry: Omit<Inquiry, "id" | "createdAt">): void {
  const inquiries = getInquiries();
  inquiries.push({
    ...inquiry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  });
  saveInquiries(inquiries);
}

// --- Settings ---
export function getSettings(): AppSettings {
  return (
    getData<AppSettings>(STORAGE_KEYS.settings) || {
      currency: "KES",
      theme: "light",
      logo: "",
    }
  );
}
export function saveSettings(settings: AppSettings): void {
  setData(STORAGE_KEYS.settings, settings);
}

// --- Session ---
export function getSession(): Session | null {
  return getData<Session>(STORAGE_KEYS.session);
}
export function setSession(user: User): void {
  const session: Session = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
  setData(STORAGE_KEYS.session, session);
}
export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.session);
}

// --- Formatting ---
export function formatCurrency(amount: number, currency: string = "KES"): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US")}`;
  }
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
