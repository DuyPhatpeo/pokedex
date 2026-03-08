import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fetchType } from '../api/pokeApi';
import { PokemonListItem } from '../types/pokemon';
import { PokemonCard } from '../components/PokemonCard';
import { SkeletonCard } from '../components/Skeleton';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { TYPE_ICONS, TYPE_OUTLINE_ICONS } from '../utils/typeIcons';
import { useColorScheme } from 'nativewind';

type Props = NativeStackScreenProps<RootStackParamList, 'TypeResults'>;

export const TypeResultsScreen = ({ route, navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [currentType, setCurrentType] = useState(route.params.type);
    const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('MainTabs');
        }
    }, [navigation]);

    const typeColor = getColorsByType(currentType);

    useEffect(() => {
        // Cập nhật currentType nếu route param thay đổi (từ Detail nhảy sang)
        setCurrentType(route.params.type);
    }, [route.params.type]);

    useEffect(() => {
        const loadTypeResults = async () => {
            setIsLoading(true);
            try {
                const data = await fetchType(currentType);
                if (data && data.pokemon) {
                    const list = data.pokemon.map((p: any) => p.pokemon);
                    setPokemonList(list);
                } else {
                    setPokemonList([]);
                }
            } catch (error) {
                console.error('Error fetching type results:', error);
                setPokemonList([]);
            } finally {
                // Thêm chút delay để skeleton trông mượt hơn
                setTimeout(() => setIsLoading(false), 300);
            }
        };
        loadTypeResults();
    }, [currentType]);

    const handlePress = useCallback((name: string, bgColor: string) => {
        navigation.navigate('Detail', { name, bgColor });
    }, [navigation]);

    const renderHeader = () => (
        <View className="w-full pb-8 relative overflow-hidden rounded-b-[40px]" style={{ backgroundColor: typeColor }}>
            {/* Background Pattern Icon */}
            {TYPE_OUTLINE_ICONS[currentType] && (
                <Image
                    source={TYPE_OUTLINE_ICONS[currentType]}
                    style={{ position: 'absolute', width: 220, height: 220, right: -40, bottom: -40, opacity: 0.15 }}
                    contentFit="contain"
                />
            )}

            {/* Nav Bar */}
            <View style={{ paddingTop: Math.max(insets.top, 20) + 10 }} className="flex-row items-center px-5 mb-4">
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
                >
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Title Section */}
            <View className="px-6 flex-row items-end justify-between">
                <View className="flex-1">
                    <Text className="text-[34px] font-black text-white capitalize">{currentType}</Text>
                    <Text className="text-white/80 font-bold text-lg mt-1">
                        {isLoading ? 'Searching...' : `${pokemonList.length} species found`}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white dark:bg-black">
            {isLoading ? (
                <View className="flex-1">
                    {renderHeader()}
                    <View className="flex-1 pt-4">
                        {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
                    </View>
                </View>
            ) : (
                <FlatList
                    data={pokemonList}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <PokemonCard item={item} onPress={handlePress} />
                    )}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};
