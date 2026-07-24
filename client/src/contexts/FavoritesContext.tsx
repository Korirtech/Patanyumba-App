import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  isFavorite as checkFavorite,
  toggleFavorite as toggleFav,
} from "@/lib/store";
import { toast } from "sonner";

interface FavoritesContextValue {
  favorites: Set<string>;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const refreshFavorites = useCallback(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    // We need to read from store each time since toggleFavorite modifies localStorage
    // But for the Set we maintain in state, we just track property IDs
  }, [user]);

  const isFavorite = useCallback(
    (propertyId: string): boolean => {
      if (!user) return false;
      return checkFavorite(user.id, propertyId);
    },
    [user]
  );

  const toggleFavorite = useCallback(
    (propertyId: string) => {
      if (!user) {
        toast.error("Please login to save favorites");
        return;
      }
      const isNow = toggleFav(user.id, propertyId);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isNow) {
          next.add(propertyId);
        } else {
          next.delete(propertyId);
        }
        return next;
      });
      toast.success(isNow ? "Added to favorites!" : "Removed from favorites");
    },
    [user]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
