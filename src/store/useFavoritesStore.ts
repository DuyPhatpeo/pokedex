import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
    favorites: string[];
    toggleFavorite: (name: string) => void;
    clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set) => ({
            favorites: [],
            toggleFavorite: (name) => set((state) => {
                const isFav = state.favorites.includes(name);
                if (isFav) {
                    return { favorites: state.favorites.filter((f) => f !== name) };
                } else {
                    return { favorites: [...state.favorites, name] };
                }
            }),
            clearFavorites: () => set({ favorites: [] }),
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
