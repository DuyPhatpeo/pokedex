import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, TextInput, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonListItem } from '../types/pokemon';
import { TYPE_ICONS } from '../utils/typeIcons';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from '../i18n/translations';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

export const HomeScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const {
        pokemonList, isLoading, isLoadingMore, loadPokemonList,
        searchQuery, setSearchQuery,
        activeTypeFilter, toggleTypeFilter, clearTypeFilter, setTypeFilter,
        sortOption, setSortOption
    } = usePokemonStore();

    const SORT_OPTIONS = [
        { key: 'id-asc', label: t.sortIdAsc, icon: 'sort-numeric-ascending' },
        { key: 'id-desc', label: t.sortIdDesc, icon: 'sort-numeric-descending' },
        { key: 'name-asc', label: t.sortNameAsc, icon: 'sort-alphabetical-ascending' },
        { key: 'name-desc', label: t.sortNameDesc, icon: 'sort-alphabetical-descending' },
    ];

    const flatListRef = useRef<FlatList>(null);

    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [showSortModal, setShowSortModal] = useState(false);

    useEffect(() => {
        loadPokemonList(true);
    }, []);

    // Debounce tìm kiếm mượt mà
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

    // Scroll to top when filters, search, or sort change
    useEffect(() => {
        if (pokemonList.length > 0 && flatListRef.current) {
            flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
    }, [searchQuery, activeTypeFilter, sortOption]);

    const handleTypePress = (type: string) => {
        toggleTypeFilter(type);
    };

    const handleSelectSort = (key: string) => {
        setSortOption(key);
        setShowSortModal(false);
    };

    const handlePress = useCallback((name: string, bgColor: string) => {
        navigation.navigate('Detail', { name, bgColor });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: PokemonListItem }) => {
        return <PokemonCard item={item} onPress={handlePress} />;
    }, [handlePress]);

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View className="py-5 items-center">
                <ActivityIndicator size="large" color="#e3350d" />
            </View>
        );
    };

    if (isLoading && pokemonList.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#e3350d" />
            </View>
        );
    }

    const POKEMON_TYPES = Object.keys(TYPE_ICONS).filter(t => t !== 'unknown' && t !== 'shadow');
    const activeSortLabel = SORT_OPTIONS.find(o => o.key === sortOption)?.label || t.sortIdAsc;

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            {/* ===== SORT MODAL ===== */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setShowSortModal(false)}>
                    <Pressable
                        className="bg-white dark:bg-[#1A1A1A] rounded-t-[28px] p-6 pb-0"
                        style={{ paddingBottom: insets.bottom + 100, marginBottom: -100 }}
                        onPress={() => { }}
                    >
                        {/* Handle bar */}
                        <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#444] self-center mb-5" />
                        <Text className="text-xl font-black text-[#111] dark:text-white mb-4">{t.sortTitle}</Text>
                        {SORT_OPTIONS.map(option => {
                            const isActive = sortOption === option.key;
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    className={`flex-row items-center py-3.5 px-4 rounded-2xl mb-2 ${isActive ? 'bg-[#303943] dark:bg-[#444]' : 'bg-[#f7f7f7] dark:bg-[#222]'}`}
                                    onPress={() => handleSelectSort(option.key)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={22}
                                        color={isActive ? '#fff' : (isDark ? '#d1d5db' : '#555')}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text className={`text-base font-semibold ${isActive ? 'text-white' : 'text-[#333] dark:text-gray-200'}`}>
                                        {option.label}
                                    </Text>
                                    {isActive && (
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 'auto' }} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* ===== HEADER ===== */}
            <View className="px-4 pt-4 pb-2.5">
                {/* Logo thay cho chữ Pokédex */}
                <Image
                    source={isDark ? require('../../assets/Pokedex-light.png') : require('../../assets/Pokedex.png')}
                    style={{ width: 110, height: 36, marginBottom: 12 }}
                    contentFit="contain"
                />
                <View className="flex-row items-center">
                    <View
                        className="flex-row items-center bg-white dark:bg-[#1A1A1A] rounded-full px-[15px] h-[50px] flex-1 border border-transparent dark:border-[#333]"
                        style={Platform.select({
                            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
                            android: { elevation: isDark ? 0 : 4 },
                            web: { boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08)' } as any
                        })}
                    >
                        <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#747476'} style={{ marginRight: 10 }} />
                        <TextInput
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
                            <TouchableOpacity onPress={handleClearSearch} className="p-1.5">
                                <Ionicons name="close-circle" size={20} color={isDark ? '#6b7280' : '#b0b0b0'} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Nút Sort */}
                    <TouchableOpacity onPress={() => setShowSortModal(true)} className="w-[50px] h-[50px] rounded-full bg-[#303943] dark:bg-[#1A1A1A] justify-center items-center ml-2.5" activeOpacity={0.8}>
                        <MaterialCommunityIcons name="sort-variant" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Active filters row */}
                {(sortOption !== 'id-asc' || activeTypeFilter.length > 0) && (
                    <View className="flex-row flex-wrap items-center mt-2.5 gap-2">
                        {sortOption !== 'id-asc' && (
                            <View className="flex-row items-center bg-[#fff0ee] dark:bg-[#e3350d22] rounded-xl px-2.5 py-1 border border-[#e3350d22] dark:border-[#e3350d44]">
                                <Ionicons name="funnel" size={12} color={isDark ? '#f87171' : '#e3350d'} style={{ marginRight: 4 }} />
                                <Text className="text-xs font-semibold text-[#e3350d] dark:text-red-400">{activeSortLabel}</Text>
                                <TouchableOpacity onPress={() => setSortOption('id-asc')} className="ml-1.5">
                                    <Ionicons name="close-circle" size={14} color={isDark ? '#f87171' : '#e3350d'} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {activeTypeFilter.map(type => (
                            <View key={type} className="flex-row items-center rounded-xl px-2.5 py-1 border" style={{ backgroundColor: hexToRgba(getColorsByType(type), 0.15), borderColor: hexToRgba(getColorsByType(type), 0.4) }}>
                                <Text className="text-xs font-bold capitalize" style={{ color: getColorsByType(type) }}>{type}</Text>
                                <TouchableOpacity onPress={() => toggleTypeFilter(type)} className="ml-1.5">
                                    <Ionicons name="close-circle" size={14} color={getColorsByType(type)} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {activeTypeFilter.length > 1 && (
                            <TouchableOpacity onPress={clearTypeFilter} className="flex-row items-center bg-gray-100 dark:bg-[#222] rounded-xl px-2.5 py-1">
                                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">Clear all</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* ===== TYPE FILTER SCROLL ===== */}
            <FlatList
                horizontal
                data={['all', ...POKEMON_TYPES]}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                className="h-[62px] mb-1.5 flex-none"
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8 }}
                renderItem={({ item }) => {
                    if (item === 'all') {
                        const isSelected = activeTypeFilter.length === 0;
                        return (
                            <TouchableOpacity
                                className={`px-3 py-2.5 rounded-[20px] justify-center items-center flex-row gap-1.5 ${isSelected ? 'bg-[#303943] dark:bg-[#444]' : 'bg-[#f0f0f0] dark:bg-[#1A1A1A]'}`}
                                onPress={clearTypeFilter}
                                activeOpacity={0.7}
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
                            className="px-3 py-2.5 rounded-[20px] justify-center items-center flex-row gap-1.5"
                            style={{ backgroundColor: bgColor }}
                            onPress={() => handleTypePress(item)}
                            activeOpacity={0.7}
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

            {/* ===== POKEMON LIST ===== */}
            <FlatList
                ref={flatListRef}
                data={pokemonList}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
                onEndReached={() => loadPokemonList()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};
