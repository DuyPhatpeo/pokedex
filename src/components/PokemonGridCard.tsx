import React, { memo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonListItem } from '../types/pokemon';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { TYPE_ICONS } from '../utils/typeIcons';
import { SkeletonGridCard } from './Skeleton';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    item: PokemonListItem;
    onPress: (name: string, bgColor: string) => void;
    containerStyle?: ViewStyle;
    index?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const PokemonGridCard = memo(({ item, onPress, containerStyle, index = 0 }: Props) => {
    const { pokemonDetails, loadPokemonDetail } = usePokemonStore();
    const detail = pokemonDetails[item.name];

    // Animation values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        if (!detail) {
            loadPokemonDetail(item.name);
        }
    }, [item.name]);

    useEffect(() => {
        if (detail) {
            opacity.value = withTiming(1, { duration: 400 });
            scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        }
    }, [detail]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!detail) {
        return <View className="w-[48%] mb-4"><SkeletonGridCard /></View>;
    }

    const mainType = detail.types[0]?.type.name || 'normal';
    const bgColor = getColorsByType(mainType);
    const imageUrl = detail.sprites.other?.['official-artwork']?.front_default || detail.sprites.front_default;
    const formattedId = `#${detail.id.toString().padStart(3, '0')}`;

    return (
        <AnimatedTouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(item.name, bgColor)}
            className="w-[48%] h-[200px] mb-4 rounded-[32px] overflow-hidden"
            style={[
                {
                    backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                    shadowColor: bgColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                },
                containerStyle,
                animatedStyle,
            ]}
        >
            <LinearGradient
                colors={[
                    isDark ? hexToRgba(bgColor, 0.25) : hexToRgba(bgColor, 0.15),
                    isDark ? hexToRgba(bgColor, 0.1) : hexToRgba(bgColor, 0.05)
                ] as [string, string, ...string[]]}
                className="flex-1 p-3 items-center justify-between"
            >
                {/* ID Tag */}
                <View className="absolute top-3 left-4 bg-black/5 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                    <Text className="text-[10px] font-black text-gray-500 dark:text-gray-400">{formattedId}</Text>
                </View>

                {/* Artwork */}
                <View className="w-full h-[100px] justify-center items-center mt-2">
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 90, height: 90 }}
                        contentFit="contain"
                        transition={600}
                    />
                </View>

                {/* Info Area (Glassmorphism effect placeholder) */}
                <View className="w-full bg-white/70 dark:bg-white/10 rounded-[20px] p-2.5 items-center">
                    <Text
                        className="text-[16px] font-black text-gray-800 dark:text-white capitalize text-center"
                        numberOfLines={1}
                    >
                        {detail.name}
                    </Text>

                    <View className="flex-row gap-1 mt-1.5">
                        {detail.types.slice(0, 1).map((t) => (
                            <View
                                key={t.type.name}
                                className="px-2 py-0.5 rounded-full flex-row items-center gap-1"
                                style={{ backgroundColor: getColorsByType(t.type.name) }}
                            >
                                <Image
                                    source={TYPE_ICONS[t.type.name]}
                                    style={{ width: 8, height: 8, tintColor: 'white' }}
                                />
                                <Text className="text-[9px] font-bold text-white uppercase">{t.type.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </AnimatedTouchableOpacity>
    );
});
