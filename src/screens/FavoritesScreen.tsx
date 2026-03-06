import React, { useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { SwipeablePokemonCard } from '../components/SwipeablePokemonCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from '../i18n/translations';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
    navigation: FavoritesScreenNavigationProp;
}

export const FavoritesScreen = ({ navigation }: Props) => {
    const { favorites } = useFavoritesStore();
    const t = useTranslation();
    const insets = useSafeAreaInsets();

    const handlePress = useCallback((name: string, bgColor: string) => {
        navigation.navigate('Detail', { name, bgColor });
    }, [navigation]);

    const renderItem = useCallback(({ item }: { item: string }) => {
        return <SwipeablePokemonCard item={{ name: item, url: '' }} onPress={handlePress} />;
    }, [handlePress]);

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            <View className="px-5 pt-4 pb-4">
                <Text className="text-3xl font-black text-[#111] dark:text-white mb-1">{t.favoritesTitle}</Text>
                <Text className="text-base text-gray-500 dark:text-gray-400">{t.favoritesSubtitle}</Text>
            </View>

            {favorites.length === 0 ? (
                <View className="flex-1 justify-center items-center pb-20">
                    <Text className="text-xl font-bold text-gray-400 dark:text-gray-500 text-center px-4">{t.emptyFavorites}</Text>
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
        </View>
    );
};
