import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, TextInput, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonListItem } from '../types/pokemon';
import { TYPE_ICONS } from '../utils/typeIcons';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useTranslation } from '../i18n/translations';

type Props = CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Search'>,
    NativeStackScreenProps<RootStackParamList>
>;

const FEATURED_POKEMON = [
    { name: 'pikachu', id: 25, type: 'electric' },
    { name: 'charizard', id: 6, type: 'fire' },
    { name: 'mewtwo', id: 150, type: 'psychic' },
    { name: 'gengar', id: 94, type: 'ghost' },
    { name: 'lucario', id: 448, type: 'fighting' },
    { name: 'greninja', id: 658, type: 'water' },
];

export const SearchScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const {
        pokemonList, isLoading, loadPokemonList,
        searchQuery, setSearchQuery,
        activeTypeFilter, toggleTypeFilter, clearTypeFilter
    } = usePokemonStore();

    const inputRef = useRef<TextInput>(null);
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        if (pokemonList.length === 0) {
            loadPokemonList(true);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== localSearch) {
                setSearchQuery(localSearch);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [localSearch, setSearchQuery, searchQuery]);

    const handleClearSearch = () => {
        setLocalSearch('');
        setSearchQuery('');
    };

    const handlePress = useCallback((name: string, bgColor: string) => {
        navigation.navigate('Detail', { name, bgColor });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: PokemonListItem }) => {
        return <PokemonCard item={item} onPress={handlePress} />;
    }, [handlePress]);

    const POKEMON_TYPES = Object.keys(TYPE_ICONS).filter(t => t !== 'unknown' && t !== 'shadow');

    // Màn hình khởi đầu khi chưa tìm kiếm
    const renderDiscoveryView = () => (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
        >
            {/* FEATURED SECTION */}
            <View className="px-5 mt-4">
                <Text className="text-xl font-black text-[#111] dark:text-white mb-4">{t.suggestedPokemon}</Text>
                <View className="flex-row flex-wrap justify-between">
                    {FEATURED_POKEMON.map((pk) => {
                        const imageUri = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pk.id}.png`;
                        const typeColor = getColorsByType(pk.type);
                        const bgColor = isDark ? hexToRgba(typeColor, 0.25) : hexToRgba(typeColor, 0.15);

                        return (
                            <TouchableOpacity
                                key={pk.name}
                                className="w-[31%] aspect-square rounded-3xl mb-3 items-center justify-center p-2"
                                style={{ backgroundColor: bgColor }}
                                activeOpacity={0.7}
                                onPress={() => handlePress(pk.name, typeColor)}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: '85%', height: '85%' }}
                                    contentFit="contain"
                                />
                                <Text
                                    className="text-[10px] font-black capitalize mt-1"
                                    style={{ color: isDark ? '#fff' : typeColor }}
                                    numberOfLines={1}
                                >
                                    {pk.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* CATEGORIES / TYPES GRID */}
            <View className="px-5 mt-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-black text-[#111] dark:text-white">{t.categories}</Text>
                    {activeTypeFilter.length > 0 && (
                        <TouchableOpacity onPress={clearTypeFilter}>
                            <Text className="text-sm font-bold text-[#e3350d]">Clear all</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {POKEMON_TYPES.map((type) => {
                        const isSelected = activeTypeFilter.includes(type);
                        const typeColor = getColorsByType(type);
                        const iconSource = TYPE_ICONS[type];

                        return (
                            <TouchableOpacity
                                key={type}
                                className="w-[48%] h-[60px] rounded-2xl mb-3 flex-row items-center px-3"
                                style={{
                                    backgroundColor: isSelected ? typeColor : (isDark ? hexToRgba(typeColor, 0.2) : hexToRgba(typeColor, 0.12)),
                                    borderWidth: isSelected ? 0 : 1,
                                    borderColor: isDark ? hexToRgba(typeColor, 0.3) : hexToRgba(typeColor, 0.2)
                                }}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('TypeResults', { type })}
                            >
                                <View className="w-8 h-8 rounded-full bg-white/90 justify-center items-center mr-2.5">
                                    <Image source={iconSource} style={{ width: 16, height: 16 }} contentFit="contain" />
                                </View>
                                <Text
                                    className="text-sm font-black capitalize flex-1"
                                    style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : typeColor) }}
                                >
                                    {type}
                                </Text>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            {/* SEARCH HEADER */}
            <View className="px-5 py-4">
                <View
                    className="flex-row items-center bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl px-4 h-[56px]"
                    style={Platform.select({
                        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
                        android: { elevation: 2 },
                        web: { boxShadow: '0 2px 10px rgba(0,0,0,0.05)' } as any
                    })}
                >
                    <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#747476'} style={{ marginRight: 12 }} />
                    <TextInput
                        ref={inputRef}
                        className="flex-1 text-base font-medium text-[#303943] dark:text-gray-100"
                        style={Platform.OS === 'web' && { outlineStyle: 'none' } as any}
                        placeholder={t.searchPlaceholder}
                        placeholderTextColor={isDark ? '#6b7280' : '#b0b0b0'}
                        value={localSearch}
                        onChangeText={setLocalSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {localSearch.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch} className="p-1">
                            <Ionicons name="close-circle" size={22} color={isDark ? '#4b5563' : '#d1d5db'} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* REFINEMENT TYPES (Visible only when searching/filtering) */}
                {(searchQuery || activeTypeFilter.length > 0) && (
                    <FlatList
                        horizontal
                        data={['all', ...POKEMON_TYPES]}
                        keyExtractor={item => item}
                        showsHorizontalScrollIndicator={false}
                        className="mt-3"
                        contentContainerStyle={{ gap: 8 }}
                        renderItem={({ item }) => {
                            if (item === 'all') {
                                const isSelected = activeTypeFilter.length === 0;
                                return (
                                    <TouchableOpacity
                                        className={`px-3 py-1.5 rounded-xl border ${isSelected ? 'bg-[#303943] border-[#303943] dark:bg-white dark:border-white' : 'bg-transparent border-gray-200 dark:border-gray-800'}`}
                                        onPress={clearTypeFilter}
                                    >
                                        <Text className={`text-xs font-bold capitalize ${isSelected ? 'text-white dark:text-black' : 'text-gray-500'}`}>
                                            All
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }
                            const isSelected = activeTypeFilter.includes(item);
                            const typeColor = getColorsByType(item);
                            return (
                                <TouchableOpacity
                                    className="px-3 py-1.5 rounded-xl border"
                                    style={{
                                        backgroundColor: isSelected ? typeColor : 'transparent',
                                        borderColor: isSelected ? typeColor : (isDark ? hexToRgba(typeColor, 0.4) : hexToRgba(typeColor, 0.2))
                                    }}
                                    onPress={() => toggleTypeFilter(item)}
                                >
                                    <Text
                                        className="text-xs font-bold capitalize"
                                        style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : typeColor) }}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>

            {/* CONTENT */}
            {!searchQuery && activeTypeFilter.length === 0 ? (
                renderDiscoveryView()
            ) : (
                <View className="flex-1">
                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#e3350d" />
                        </View>
                    ) : pokemonList.length === 0 ? (
                        <View className="flex-1 justify-center items-center px-10">
                            <Ionicons name="search-outline" size={80} color={isDark ? '#333' : '#f0f0f0'} />
                            <Text className="text-lg font-bold text-gray-400 text-center mt-4">
                                No Pokémon found for "{searchQuery}"
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={pokemonList}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.name}
                            contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                        />
                    )}
                </View>
            )}
        </View>
    );
};
