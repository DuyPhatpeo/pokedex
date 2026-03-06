import React, { useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonListItem } from '../types/pokemon';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { TYPE_ICONS, TYPE_OUTLINE_ICONS } from '../utils/typeIcons';
import { SkeletonCard } from './Skeleton';

interface Props {
    item: PokemonListItem;
    onPress: (name: string, bgColor: string) => void;
    containerStyle?: object;
}

export const PokemonCard = memo(({ item, onPress, containerStyle }: Props) => {
    const { pokemonDetails, loadPokemonDetail } = usePokemonStore();
    const detail = pokemonDetails[item.name];

    useEffect(() => {
        loadPokemonDetail(item.name);
    }, [item.name]);

    if (!detail) {
        return <SkeletonCard />;
    }

    const mainType = detail.types[0]?.type.name || 'normal';
    const bgColor = getColorsByType(mainType);
    const lightBgColor = hexToRgba(bgColor, 0.15); // Nền màu nhạt 15% opacity

    const formattedId = `#${detail.id.toString().padStart(3, '0')}`;
    const imageUrl = detail.sprites.other?.['official-artwork']?.front_default || detail.sprites.front_default;

    return (
        <TouchableOpacity
            className="rounded-[28px] my-[10px] mx-[15px] h-[140px] flex-row items-center pl-[20px] overflow-hidden relative border-[1.5px]"
            style={[
                {
                    backgroundColor: lightBgColor,
                    borderColor: hexToRgba(bgColor, 0.5),
                },
                containerStyle,
            ] as any}
            onPress={() => onPress(item.name, bgColor)}
            activeOpacity={0.9}
        >
            {/* Right dark background shape */}
            <View
                className="absolute right-0 top-0 bottom-0 w-[38%] rounded-l-[60px] justify-center items-center overflow-hidden"
                style={{ backgroundColor: bgColor }}
            >
                {TYPE_OUTLINE_ICONS[mainType] && (
                    <Image
                        source={TYPE_OUTLINE_ICONS[mainType]}
                        style={{ position: 'absolute', right: -10, width: 120, height: 120, opacity: 0.2 }}
                        contentFit="contain"
                    />
                )}
            </View>

            <View className="flex-1 z-[2]">
                <Text className="text-[15px] text-[#555] font-bold mb-1">{formattedId}</Text>
                <Text className="text-[26px] font-black text-[#111] capitalize mb-[15px]" numberOfLines={1}>{detail.name}</Text>
                <View className="flex-row flex-wrap gap-2">
                    {detail.types.map((t) => (
                        <View
                            key={t.type.name}
                            className="rounded-[20px] px-2 py-[5px] flex-row items-center gap-[6px] pl-1"
                            style={{ backgroundColor: getColorsByType(t.type.name) }}
                        >
                            {TYPE_ICONS[t.type.name] && (
                                <View className="w-[22px] h-[22px] rounded-full bg-white justify-center items-center">
                                    <Image source={TYPE_ICONS[t.type.name]} style={{ width: 14, height: 14 }} contentFit="contain" />
                                </View>
                            )}
                            <Text className="text-white text-[13px] font-bold capitalize mr-[6px]">{t.type.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View className="w-[120px] h-[120px] justify-center items-center z-[3] absolute right-[15px] top-[10px]">
                <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 110, height: 110 }}
                    contentFit="contain"
                    transition={500}
                />
            </View>
        </TouchableOpacity>
    );
});
