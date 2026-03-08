import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonStore } from '../store/usePokemonStore';
import { GENERATIONS, Generation } from '../constants/generations';
import { useTranslation } from '../i18n/translations';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonListItem } from '../types/pokemon';
import { SkeletonList, SkeletonBox } from '../components/Skeleton';

type Props = CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Generations'>,
    NativeStackScreenProps<RootStackParamList>
>;

const REGION_COLORS: Record<string, string[]> = {
    'Kanto': ['#78C850', '#5CA935'],
    'Johto': ['#ffcc33', '#d4a017'],
    'Hoenn': ['#6890F0', '#4A71C0'],
    'Sinnoh': ['#8c78a8', '#6b5a85'],
    'Unova': ['#a040a0', '#7a307a'],
    'Kalos': ['#f85888', '#d0406b'],
    'Alola': ['#f08030', '#c06020'],
    'Galar': ['#705898', '#554374'],
    'Paldea': ['#e0c068', '#b89a50'],
};


export const GenerationsScreen = ({ navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { allPokemon, loadAllPokemon, preloadGenerationDetails } = usePokemonStore();
    const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
    const [genPokemon, setGenPokemon] = useState<PokemonListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedGen && allPokemon.length > 0) {
            const filtered = allPokemon.filter((p: PokemonListItem) => {
                const parts = p.url.split('/').filter(Boolean);
                const id = parseInt(parts[parts.length - 1], 10);
                return id >= selectedGen.startId && id <= selectedGen.endId;
            });
            setGenPokemon(filtered);
        }
    }, [selectedGen, allPokemon]);

    const handleSelectGen = useCallback(async (gen: Generation) => {
        setSelectedGen(gen);
        setIsLoading(true);

        try {
            if (allPokemon.length === 0) {
                await loadAllPokemon();
            }

            // Lọc danh sách pokemon của thế hệ này để preload
            const filtered = allPokemon.length > 0 ? allPokemon.filter((p: PokemonListItem) => {
                const parts = p.url.split('/').filter(Boolean);
                const id = parseInt(parts[parts.length - 1], 10);
                return id >= gen.startId && id <= gen.endId;
            }) : [];

            if (filtered.length > 0) {
                // Preload 20 con đầu tiên để hiện lên ngay lập tức
                const firstBatch = filtered.slice(0, 20).map(p => p.name);
                await preloadGenerationDetails(firstBatch);
            }
        } catch (error) {
            console.error('Error selecting generation:', error);
        } finally {
            setIsLoading(false);
        }
    }, [allPokemon, loadAllPokemon, preloadGenerationDetails]);

    const handleBack = () => {
        setSelectedGen(null);
        setGenPokemon([]);
    };

    const handlePressPokemon = useCallback((name: string, bgColor: string) => {
        navigation.navigate('Detail', { name, bgColor });
    }, [navigation]);

    const renderGenItem = ({ item }: { item: Generation }) => {
        const colors = REGION_COLORS[item.region] || ['#666', '#444'];
        const mascotUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.mascotId}.png`;

        return (
            <TouchableOpacity
                onPress={() => handleSelectGen(item)}
                activeOpacity={0.85}
                className="w-[47%] h-[130px] mb-4 rounded-[32px] overflow-hidden"
                style={{
                    shadowColor: colors[0],
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.35,
                    shadowRadius: 10,
                    elevation: 8,
                    backgroundColor: isDark ? '#1A1A1A' : '#fff'
                }}
            >
                <LinearGradient
                    colors={colors as [string, string, ...string[]]}
                    className="flex-1 p-4 flex-col justify-between"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View
                        style={{
                            position: 'absolute',
                            right: -20,
                            bottom: -20,
                            width: 110,
                            height: 110,
                            borderRadius: 55,
                            backgroundColor: 'white',
                            opacity: 0.18
                        }}
                    />

                    <View>
                        <Text className="text-white text-[19px] font-black">{item.name}</Text>
                        <View className="bg-white/20 self-start px-2 py-0.5 rounded-full mt-1">
                            <Text className="text-white text-[10px] font-bold uppercase tracking-widest">{item.region}</Text>
                        </View>
                    </View>

                    <View className="absolute right-[-12px] bottom-[-8px]">
                        <Image
                            source={{ uri: mascotUrl }}
                            style={{ width: 95, height: 95 }}
                            contentFit="contain"
                        />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            {/* Header Area */}
            <View className="px-5 pt-4 pb-2">
                <View className="flex-row items-center mb-2">
                    {selectedGen && (
                        <TouchableOpacity
                            onPress={handleBack}
                            className="mr-3 p-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full"
                        >
                            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#303943'} />
                        </TouchableOpacity>
                    )}
                    <Text className="text-[32px] font-black text-[#303943] dark:text-white">
                        {selectedGen ? selectedGen.region : t.tabGenerations}
                    </Text>
                </View>
                <Text className="text-gray-500 dark:text-gray-400 font-bold mb-4">
                    {selectedGen
                        ? `${selectedGen.name} • ${genPokemon.length} Pokémon`
                        : (t.suggestedPokemon || 'Select a region to explore')}
                </Text>
            </View>

            {isLoading ? (
                <View className="flex-1">
                    <SkeletonList count={6} />
                </View>
            ) : selectedGen ? (
                <FlatList
                    key="pokemon-list-sync"
                    data={genPokemon}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => <PokemonCard item={item} onPress={handlePressPokemon} />}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            ) : (
                <FlatList
                    key="gen-list"
                    data={GENERATIONS}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderGenItem}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};
