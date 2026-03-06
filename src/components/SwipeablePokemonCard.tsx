import React, { useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
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
    const swipeableRef = useRef<Swipeable>(null);

    const renderRightActions = () => {
        return (
            <TouchableOpacity
                style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.18)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 130,
                    height: 140,
                    borderTopRightRadius: 28,
                    borderBottomRightRadius: 28,
                    marginTop: 10,
                    marginBottom: 10,
                    marginRight: 15,
                    marginLeft: -46,
                    borderWidth: 1.5,
                    borderLeftWidth: 0,
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                }}
                onPress={() => {
                    swipeableRef.current?.close();
                    toggleFavorite(item.name);
                }}
                activeOpacity={0.7}
            >
                <Ionicons name="trash-outline" size={28} color="#b91c1c" />
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            overshootRight={false}
            friction={2}
            rightThreshold={40}
        >
            <PokemonCard item={item} onPress={onPress} />
        </Swipeable>
    );
};
