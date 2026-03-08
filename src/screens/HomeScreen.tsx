import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonCard } from '../components/PokemonCard';
import { SkeletonList, SkeletonBox } from '../components/Skeleton';
import { PokemonListItem } from '../types/pokemon';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { TYPE_ICONS } from '../utils/typeIcons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useTranslation } from '../i18n/translations';

type Props = CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Pokedex'>,
    NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const {
        homePokemonList, isLoading, isLoadingMore, loadPokemonList,
        sortOption, setSortOption
    } = usePokemonStore();

    const SORT_OPTIONS = [
        { key: 'id-asc', label: t.sortIdAsc, icon: 'sort-numeric-ascending' },
        { key: 'id-desc', label: t.sortIdDesc, icon: 'sort-numeric-descending' },
        { key: 'name-asc', label: t.sortNameAsc, icon: 'sort-alphabetical-ascending' },
        { key: 'name-desc', label: t.sortNameDesc, icon: 'sort-alphabetical-descending' },
    ];

    const flatListRef = useRef<FlatList>(null);
    const [showSortModal, setShowSortModal] = useState(false);

    useEffect(() => {
        loadPokemonList(true);
    }, []);

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

    if (isLoading && homePokemonList.length === 0) {
        return (
            <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
                <View className="px-5 pt-4 pb-2">
                    <View className="flex-row items-center justify-between mb-5">
                        <SkeletonBox height={36} width={110} borderRadius={10} />
                        <SkeletonBox height={32} width={32} borderRadius={16} />
                    </View>
                    <View className="flex-row gap-2 mb-4">
                        <SkeletonBox height={34} width={80} borderRadius={20} />
                        <SkeletonBox height={34} width={80} borderRadius={20} />
                        <SkeletonBox height={34} width={80} borderRadius={20} />
                    </View>
                </View>
                <SkeletonList count={6} />
            </View>
        );
    }

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
            <View className="px-5 pt-4 pb-2">
                <View className="flex-row items-center justify-between mb-5">
                    <Image
                        source={isDark ? require('../../assets/Pokedex-light.png') : require('../../assets/Pokedex.png')}
                        style={{ width: 110, height: 36 }}
                        contentFit="contain"
                    />
                    <TouchableOpacity
                        onPress={() => setShowSortModal(true)}
                        className="p-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full"
                    >
                        <MaterialCommunityIcons name="sort-variant" size={24} color={isDark ? '#fff' : '#303943'} />
                    </TouchableOpacity>
                </View>

                {/* Categories / Types List */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={Object.keys(TYPE_ICONS).filter(t => t !== 'unknown' && t !== 'shadow')}
                    keyExtractor={item => item}
                    contentContainerStyle={{ gap: 10, paddingRight: 20 }}
                    renderItem={({ item: type }) => {
                        const typeColor = getColorsByType(type);
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('TypeResults', { type })}
                                className="px-3 py-2 rounded-2xl flex-row items-center gap-2 border"
                                style={{
                                    backgroundColor: isDark ? hexToRgba(typeColor, 0.2) : hexToRgba(typeColor, 0.1),
                                    borderColor: isDark ? hexToRgba(typeColor, 0.4) : hexToRgba(typeColor, 0.2)
                                }}
                            >
                                <View className="w-6 h-6 rounded-full bg-white justify-center items-center">
                                    <Image source={TYPE_ICONS[type]} style={{ width: 14, height: 14 }} contentFit="contain" />
                                </View>
                                <Text className="text-sm font-bold capitalize" style={{ color: isDark ? '#fff' : typeColor }}>{type}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                {/* Active Sort & Generation Tags */}
                <View className="flex-row items-center flex-wrap gap-2 mt-2 px-1">
                    {sortOption !== 'id-asc' && (
                        <View className="flex-row items-center bg-[#fff0ee] dark:bg-[#e3350d22] rounded-xl px-2.5 py-1 border border-[#e3350d22] dark:border-[#e3350d44]">
                            <Ionicons name="funnel" size={12} color={isDark ? '#f87171' : '#e3350d'} style={{ marginRight: 4 }} />
                            <Text className="text-xs font-semibold text-[#e3350d] dark:text-red-400">{activeSortLabel}</Text>
                            <TouchableOpacity onPress={() => setSortOption('id-asc')} className="ml-1.5">
                                <Ionicons name="close-circle" size={14} color={isDark ? '#f87171' : '#e3350d'} />
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </View>

            {/* ===== POKEMON LIST ===== */}
            <FlatList
                ref={flatListRef}
                data={homePokemonList}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20, paddingTop: 10 }}
                onEndReached={() => loadPokemonList()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};
