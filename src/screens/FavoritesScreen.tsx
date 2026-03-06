import React, { useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { SwipeablePokemonCard } from '../components/SwipeablePokemonCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
    navigation: FavoritesScreenNavigationProp;
}

export const FavoritesScreen = ({ navigation }: Props) => {
    const { favorites } = useFavoritesStore();

    const handlePress = useCallback((name: string, bgColor: string) => {
        navigation.navigate('Detail', { name, bgColor });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: string }) => {
        return <SwipeablePokemonCard item={{ name: item, url: '' }} onPress={handlePress} />;
    }, [handlePress]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-4 pb-4">
                <Text className="text-3xl font-black text-[#111] mb-1">Favorites</Text>
                <Text className="text-base text-gray-500">Your favorite Pokémon list.</Text>
            </View>

            {favorites.length === 0 ? (
                <View className="flex-1 justify-center items-center pb-20">
                    <Text className="text-xl font-bold text-gray-400">No Pokémon added yet</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};
