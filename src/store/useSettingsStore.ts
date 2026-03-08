import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageCode = 'en' | 'vi' | 'ja' | 'zh' | 'es' | 'fr';
export type UnitSystem = 'metric' | 'imperial';

interface SettingsState {
    language: LanguageCode;
    unitSystem: UnitSystem;
    setLanguage: (lang: LanguageCode) => void;
    setUnitSystem: (unit: UnitSystem) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'en',
            unitSystem: 'metric',
            setLanguage: (lang) => set({ language: lang }),
            setUnitSystem: (unit) => set({ unitSystem: unit }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
