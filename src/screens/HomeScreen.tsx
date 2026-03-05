import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, Text, TextInput, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonListItem } from '../types/pokemon';
import { TYPE_ICONS } from '../utils/typeIcons';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const SORT_OPTIONS = [
    { key: 'id-asc', label: 'ID Ascending', icon: 'sort-numeric-ascending' },
    { key: 'id-desc', label: 'ID Descending', icon: 'sort-numeric-descending' },
    { key: 'name-asc', label: 'Name A → Z', icon: 'sort-alphabetical-ascending' },
    { key: 'name-desc', label: 'Name Z → A', icon: 'sort-alphabetical-descending' },
];

export const HomeScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const {
        pokemonList, isLoading, isLoadingMore, loadPokemonList,
        searchQuery, setSearchQuery,
        activeTypeFilter, setTypeFilter,
        sortOption, setSortOption
    } = usePokemonStore();

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
        if (activeTypeFilter === type) {
            setTypeFilter(null);
        } else {
            setTypeFilter(type);
        }
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
            <View style={styles.footerLoader}>
                <ActivityIndicator size="large" color="#e3350d" />
            </View>
        );
    };

    if (isLoading && pokemonList.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#e3350d" />
            </View>
        );
    }

    const POKEMON_TYPES = Object.keys(TYPE_ICONS).filter(t => t !== 'unknown' && t !== 'shadow');
    const activeSortLabel = SORT_OPTIONS.find(o => o.key === sortOption)?.label || 'Số Thứ Tự';

    return (
        <SafeAreaView style={styles.container}>
            {/* ===== SORT MODAL ===== */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
                    <Pressable style={[styles.modalContent, { paddingBottom: insets.bottom + 100, marginBottom: -100 }]} onPress={() => { }}>
                        {/* Handle bar */}
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Sort Pokémon</Text>
                        {SORT_OPTIONS.map(option => {
                            const isActive = sortOption === option.key;
                            return (
                                <TouchableOpacity
                                    key={option.key}
                                    style={[styles.sortOptionRow, isActive && styles.sortOptionActive]}
                                    onPress={() => handleSelectSort(option.key)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={22}
                                        color={isActive ? '#fff' : '#555'}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text style={[styles.sortOptionText, isActive && styles.sortOptionTextActive]}>
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
            <View style={styles.header}>
                {/* Logo thay cho chữ Pokédex */}
                <Image
                    source={require('../../assets/Pokedex.png')}
                    style={styles.headerLogo}
                    contentFit="contain"
                />
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#747476" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                            placeholder="Search Pokemon..."
                            placeholderTextColor="#747476"
                            value={localSearch}
                            onChangeText={setLocalSearch}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {localSearch.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch} style={styles.clearIconWrapper}>
                                <Ionicons name="close-circle" size={20} color="#b0b0b0" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Nút Sort */}
                    <TouchableOpacity onPress={() => setShowSortModal(true)} style={styles.sortButton} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="sort-variant" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Active Sort Indicator */}
                {sortOption !== 'id-asc' && (
                    <View style={styles.activeSortBadge}>
                        <Ionicons name="funnel" size={12} color="#e3350d" style={{ marginRight: 4 }} />
                        <Text style={styles.activeSortText}>{activeSortLabel}</Text>
                        <TouchableOpacity onPress={() => setSortOption('id-asc')} style={{ marginLeft: 6 }}>
                            <Ionicons name="close-circle" size={14} color="#e3350d" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ===== TYPE FILTER SCROLL ===== */}
            <FlatList
                horizontal
                data={['all', ...POKEMON_TYPES]}
                keyExtractor={item => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeFilterList}
                style={styles.typeFilterScroll}
                renderItem={({ item }) => {
                    if (item === 'all') {
                        const isSelected = activeTypeFilter === null;
                        return (
                            <TouchableOpacity
                                style={[styles.typeFilterBadge, { backgroundColor: isSelected ? '#303943' : '#f0f0f0', flexDirection: 'row', gap: 5 }]}
                                onPress={() => setTypeFilter(null)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="apps" size={14} color={isSelected ? '#fff' : '#555'} />
                                <Text style={[styles.typeFilterText, { color: isSelected ? '#fff' : '#555' }]}>
                                    All
                                </Text>
                            </TouchableOpacity>
                        );
                    }
                    const isSelected = activeTypeFilter === item;
                    const typeColor = getColorsByType(item);
                    const bgColor = isSelected ? typeColor : hexToRgba(typeColor, 0.12);
                    const iconSource = TYPE_ICONS[item];
                    return (
                        <TouchableOpacity
                            style={[styles.typeFilterBadge, { backgroundColor: bgColor, flexDirection: 'row', gap: 6 }]}
                            onPress={() => handleTypePress(item)}
                            activeOpacity={0.7}
                        >
                            {iconSource && (
                                <View style={[styles.typeIconCircle, { backgroundColor: '#fff' }]}>
                                    <Image source={iconSource} style={styles.typeIconImg} contentFit="contain" />
                                </View>
                            )}
                            <Text style={[styles.typeFilterText, { color: isSelected ? '#fff' : typeColor }]}>
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
                contentContainerStyle={styles.listContent}
                onEndReached={() => loadPokemonList()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 36,
        paddingBottom: 10,
    },
    headerLogo: {
        width: 110,
        height: 36,
        marginBottom: 12,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        flex: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }
        }),
    },
    sortButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#303943',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    clearIconWrapper: {
        padding: 5,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#303943',
    },
    activeSortBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#fff0ee',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#e3350d22',
    },
    activeSortText: {
        fontSize: 12,
        color: '#e3350d',
        fontWeight: '600',
    },

    // Type filter
    typeFilterScroll: {
        height: 62,
        marginBottom: 6,
    },
    typeFilterList: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
    },
    typeFilterBadge: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    typeFilterText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    typeIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeIconImg: {
        width: 12,
        height: 12,
    },

    // List
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },

    // Sort Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 0,
    },
    modalInner: {
        paddingBottom: 16,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ddd',
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111',
        marginBottom: 16,
    },
    sortOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: '#f7f7f7',
    },
    sortOptionActive: {
        backgroundColor: '#303943',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    sortOptionTextActive: {
        color: '#fff',
    },
});
