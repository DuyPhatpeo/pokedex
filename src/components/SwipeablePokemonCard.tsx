import React from 'react';
import { TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { PokemonCard } from './PokemonCard';
import { PokemonListItem } from '../types/pokemon';
import { useFavoritesStore } from '../store/useFavoritesStore';

interface Props {
    item: PokemonListItem;
    onPress: (name: string, bgColor: string) => void;
}

export const SwipeablePokemonCard = ({ item, onPress }: Props) => {
    const { toggleFavorite } = useFavoritesStore();

    const renderRightActions = () => {
        return (
            <TouchableOpacity
                className="bg-red-500 justify-center items-center w-[80px] h-[140px] rounded-[28px] my-[10px] mr-[15px]"
                onPress={() => toggleFavorite(item.name)}
                activeOpacity={0.8}
            >
                <Ionicons name="trash-outline" size={30} color="#fff" />
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
            <PokemonCard item={item} onPress={onPress} />
        </Swipeable>
    );
};
