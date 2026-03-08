import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, TextInput, TouchableOpacity, Platform, Pressable } from 'react-native';
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
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useTranslation } from '../i18n/translations';

type Props = BottomTabScreenProps<MainTabParamList, 'Search'>;

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

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);

    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        // Focus search input on mount
        setTimeout(() => inputRef.current?.focus(), 100);

        // Ensure list is loaded if it's empty
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

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            {/* HEADER / SEARCH BAR */}
            <View className="px-4 py-3 flex-row items-center">
                <View
                    className="flex-1 flex-row items-center bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl px-4 h-[50px]"
                    style={Platform.OS === 'web' ? { boxShadow: 'none' } : {}}
                >
                    <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#747476'} style={{ marginRight: 10 }} />
                    <TextInput
                        ref={inputRef}
                        className="flex-1 text-base text-[#303943] dark:text-gray-100"
                        style={Platform.OS === 'web' && { outlineStyle: 'none' } as any}
                        placeholder={t.searchPlaceholder}
                        placeholderTextColor={isDark ? '#9ca3af' : '#747476'}
                        value={localSearch}
                        onChangeText={setLocalSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {localSearch.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch} className="p-1">
                            <Ionicons name="close-circle" size={20} color={isDark ? '#6b7280' : '#b0b0b0'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* TYPE FILTERS */}
            <View className="h-[60px] flex-none">
                <FlatList
                    horizontal
                    data={['all', ...POKEMON_TYPES]}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
                    renderItem={({ item }) => {
                        if (item === 'all') {
                            const isSelected = activeTypeFilter.length === 0;
                            return (
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-full justify-center items-center flex-row gap-2 ${isSelected ? 'bg-[#303943] dark:bg-[#444]' : 'bg-[#f0f0f0] dark:bg-[#1A1A1A]'}`}
                                    onPress={clearTypeFilter}
                                >
                                    <Ionicons name="apps" size={14} color={isSelected ? '#fff' : (isDark ? '#d1d5db' : '#555')} />
                                    <Text className={`text-[13px] font-bold capitalize ${isSelected ? 'text-white' : 'text-[#555] dark:text-gray-300'}`}>
                                        All
                                    </Text>
                                </TouchableOpacity>
                            );
                        }
                        const isSelected = activeTypeFilter.includes(item);
                        const typeColor = getColorsByType(item);
                        const bgColor = isSelected ? typeColor : (isDark ? hexToRgba(typeColor, 0.2) : hexToRgba(typeColor, 0.12));
                        const iconSource = TYPE_ICONS[item];
                        return (
                            <TouchableOpacity
                                className="px-4 py-2 rounded-full justify-center items-center flex-row gap-2"
                                style={{ backgroundColor: bgColor }}
                                onPress={() => toggleTypeFilter(item)}
                            >
                                {iconSource && (
                                    <View className="w-5 h-5 rounded-full bg-white justify-center items-center">
                                        <Image source={iconSource} style={{ width: 12, height: 12 }} contentFit="contain" />
                                    </View>
                                )}
                                <Text className="text-[13px] font-bold capitalize" style={{ color: isSelected ? '#fff' : (isDark ? '#fff' : typeColor) }}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* RESULTS */}
            <View className="flex-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#e3350d" />
                    </View>
                ) : pokemonList.length === 0 ? (
                    <View className="flex-1 justify-center items-center px-10">
                        <Ionicons name="search-outline" size={80} color={isDark ? '#333' : '#eee'} />
                        <Text className="text-lg text-gray-500 text-center mt-4">No Pokémon found for "{searchQuery}"</Text>
                    </View>
                ) : (
                    <FlatList
                        data={pokemonList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
};
