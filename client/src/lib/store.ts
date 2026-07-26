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
    // Initialize with empty array – all properties are now managed via the Admin page
    setData<Property[]>(STORAGE_KEYS.properties, []);
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
export function setSession(userOrSession: User | Session): void {
  const session: Session = {
    id: userOrSession.id,
    name: userOrSession.name,
    email: userOrSession.email,
    phone: userOrSession.phone,
    role: userOrSession.role,
    status: userOrSession.status,
    createdAt: userOrSession.createdAt,
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
