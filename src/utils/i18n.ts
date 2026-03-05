// Simple i18n utility for EN/VI bilingual support

type Language = 'vi' | 'en';

const translations = {
    vi: {
        // Home Screen
        appTitle: 'Pokédex',
        searchPlaceholder: 'Tìm kiếm Pokémon...',
        sortTitle: 'Sắp xếp Pokémon',
        sortIdAsc: 'Số Thứ Tự Tăng Dần',
        sortIdDesc: 'Số Thứ Tự Giảm Dần',
        sortNameAz: 'Tên A → Z',
        sortNameZa: 'Tên Z → A',
        filterAll: 'Tất cả',
        // Detail Screen
        weight: 'CÂN NẶNG',
        height: 'CHIỀU CAO',
        category: 'THỂ LOẠI',
        ability: 'KỸ NĂNG',
        gender: 'GIỚI TÍNH',
        genderless: 'Vô tính',
        weaknesses: 'Điểm Yếu',
        evolutions: 'Tiến Hóa',
        levelLabel: 'Cấp',
    },
    en: {
        // Home Screen
        appTitle: 'Pokédex',
        searchPlaceholder: 'Search Pokémon...',
        sortTitle: 'Sort Pokémon',
        sortIdAsc: 'ID Ascending',
        sortIdDesc: 'ID Descending',
        sortNameAz: 'Name A → Z',
        sortNameZa: 'Name Z → A',
        filterAll: 'All',
        // Detail Screen
        weight: 'WEIGHT',
        height: 'HEIGHT',
        category: 'CATEGORY',
        ability: 'ABILITY',
        gender: 'GENDER',
        genderless: 'Genderless',
        weaknesses: 'Weaknesses',
        evolutions: 'Evolutions',
        levelLabel: 'Level',
    }
} as const;

type TranslationKey = keyof typeof translations['vi'];

let currentLang: Language = 'vi';

export const setLanguage = (lang: Language) => {
    currentLang = lang;
};

export const getCurrentLanguage = (): Language => currentLang;

export const t = (key: TranslationKey): string => {
    return translations[currentLang][key] ?? translations['vi'][key] ?? key;
};
