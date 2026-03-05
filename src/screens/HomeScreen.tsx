import React, { useEffect, useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonListItem } from '../types/pokemon';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

export const HomeScreen = ({ navigation }: Props) => {
    const { pokemonList, isLoading, isLoadingMore, loadPokemonList, searchQuery, setSearchQuery } = usePokemonStore();
    const [localSearch, setLocalSearch] = useState(searchQuery);

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pokédex</Text>
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
            </View>
            <FlatList
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
        padding: 16,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#303943',
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
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
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    }
});
