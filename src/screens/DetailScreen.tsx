import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { usePokemonStore } from '../store/usePokemonStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay } from 'react-native-reanimated';
import { TYPE_ICONS, TYPE_OUTLINE_ICONS } from '../utils/typeIcons';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { SkeletonDetailScreen } from '../components/Skeleton';
import { useTranslation } from '../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export const DetailScreen = ({ route, navigation }: Props) => {
    const insets = useSafeAreaInsets();
    const { name, bgColor } = route.params;
    const { pokemonDetails, loadPokemonDetail } = usePokemonStore();
    const detail = pokemonDetails[name];

    const { favorites, toggleFavorite } = useFavoritesStore();
    const isFavorite = favorites.includes(name);
    const t = useTranslation();

    // Entrance animations
    const bodyY = useSharedValue(60);
    const bodyOpacity = useSharedValue(0);
    const imageScale = useSharedValue(0.6);
    const imageOpacity = useSharedValue(0);

    useEffect(() => {
        loadPokemonDetail(name);
    }, [name]);

    useEffect(() => {
        if (detail) {
            bodyY.value = withSpring(0, { damping: 20, stiffness: 100 });
            bodyOpacity.value = withTiming(1, { duration: 400 });
            imageScale.value = withDelay(150, withSpring(1, { damping: 14, stiffness: 120 }));
            imageOpacity.value = withDelay(150, withTiming(1, { duration: 300 }));
        }
    }, [detail]);

    const bodyStyle = useAnimatedStyle(() => ({
        opacity: bodyOpacity.value,
        transform: [{ translateY: bodyY.value }],
    }));

    const imageStyle = useAnimatedStyle(() => ({
        opacity: imageOpacity.value,
        transform: [{ scale: imageScale.value }],
    }));

    if (!detail || !detail.id) {
        return <SkeletonDetailScreen bgColor={bgColor} />;
    }

    const formattedId = `#${detail.id.toString().padStart(3, '0')}`;
    const imageUrl = detail.sprites?.other?.['official-artwork']?.front_default || detail.sprites?.front_default || '';

    // Render tỷ lệ giới tính gộp 2 màu
    const renderGender = () => {
        if (detail.genderRate === undefined || detail.genderRate === -1) {
            return (
                <View className="flex-col w-full mb-9">
                    <Text className="text-[14px] text-[#666] dark:text-gray-300 font-bold text-center mb-2.5">{t.gender}</Text>
                    <Text className="text-center text-[#666] dark:text-gray-300 font-bold">Genderless</Text>
                </View>
            );
        }
        const femaleRatio = (detail.genderRate / 8) * 100;
        const maleRatio = 100 - femaleRatio;
        return (
            <View className="flex-col w-full mb-9">
                <Text className="text-[14px] text-[#666] dark:text-gray-300 font-bold text-center mb-2.5">{t.gender}</Text>
                <View className="flex-row h-2 rounded flex-1 overflow-hidden mb-2">
                    <View className="bg-blue-500 h-full" style={{ width: `${maleRatio}%` }} />
                    <View className="bg-pink-400 h-full" style={{ width: `${femaleRatio}%` }} />
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-[13px] text-[#444] dark:text-gray-200 font-bold">♂ {maleRatio.toString().replace('.', ',')}%</Text>
                    <Text className="text-[13px] text-[#444] dark:text-gray-200 font-bold">♀ {femaleRatio.toString().replace('.', ',')}%</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: bgColor }}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 0 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* HEADER SECTION */}
                <View className="w-full pb-5 relative z-[5]" style={{ backgroundColor: bgColor }}>
                    {/* Background Pattern */}
                    {TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal'] && (
                        <Image
                            source={TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal']}
                            style={{ position: 'absolute', width: 280, height: 280, right: -80, bottom: -20, opacity: 0.1 }}
                            contentFit="contain"
                        />
                    )}

                    {/* Navigation Bar */}
                    <View style={{ paddingTop: Math.max(insets.top, 20) + 10 }} className="flex-row items-center justify-between px-5 mb-2.5">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleFavorite(name)} className="p-1">
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color={isFavorite ? "#ef4444" : "#fff"} />
                        </TouchableOpacity>
                    </View>

                    {/* Title Box */}
                    <View className="px-6 mt-1.5 mb-[15px]">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-[38px] font-black text-white capitalize flex-1">{detail.name}</Text>
                            <Text className="text-lg font-bold text-white">{formattedId}</Text>
                        </View>

                        {/* Types Layout */}
                        <View className="flex-row gap-2.5">
                            {detail.types?.map((t) => (
                                <TouchableOpacity
                                    key={t.type.name}
                                    onPress={() => {
                                        navigation.navigate('TypeResults', { type: t.type.name });
                                    }}
                                    className="rounded-[20px] px-3 py-1.5 flex-row items-center gap-[7px] border-[1.5px] border-white/60"
                                    style={{ backgroundColor: hexToRgba(getColorsByType(t.type.name), 0.75) }}>
                                    {TYPE_ICONS[t.type.name] && (
                                        <View className="w-[22px] h-[22px] rounded-full bg-white justify-center items-center">
                                            <Image source={TYPE_ICONS[t.type.name]} style={{ width: 14, height: 14 }} contentFit="contain" />
                                        </View>
                                    )}
                                    <Text className="text-white text-[14px] font-bold capitalize">{t.type.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Pokemon Avatar Container */}
                    <View className="items-center justify-center h-[160px] z-[10] -mb-[80px]">
                        {imageUrl ? (
                            <Animated.View style={imageStyle}>
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={{ width: 240, height: 240, zIndex: 10 }}
                                    contentFit="contain"
                                    transition={400}
                                />
                            </Animated.View>
                        ) : null}
                    </View>
                </View>

                {/* BODY SECTION */}
                <Animated.View className="bg-white dark:bg-black rounded-t-[50px] px-[25px] pb-[60px] mt-0 z-[1] flex-1 min-h-[60%]" style={bodyStyle}>
                    <View className="h-[90px]" />

                    {/* Description */}
                    {detail.description ? (
                        <Text className="text-[15px] text-[#555] dark:text-gray-300 leading-[22px] text-justify mb-[30px]">{detail.description}</Text>
                    ) : null}

                    {/* Stats 2x2 Grid */}
                    <View className="flex-row flex-wrap gap-3 justify-between mb-6">
                        <View className="w-[48%] border border-gray-200 dark:border-[#333] rounded-[20px] py-[15px] px-5 bg-white dark:bg-[#1A1A1A]">
                            <View className="flex-row items-center gap-1.5 mb-2">
                                <MaterialCommunityIcons name="weight" size={16} color="#999" />
                                <Text className="text-[13px] text-[#999] dark:text-gray-400 font-bold uppercase">{t.weight}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-lg font-bold text-[#111] dark:text-white capitalize">{(detail.weight || 0) / 10} kg</Text>
                            </View>
                        </View>

                        <View className="w-[48%] border border-gray-200 dark:border-[#333] rounded-[20px] py-[15px] px-5 bg-white dark:bg-[#1A1A1A]">
                            <View className="flex-row items-center gap-1.5 mb-2">
                                <MaterialCommunityIcons name="format-line-spacing" size={16} color="#999" />
                                <Text className="text-[13px] text-[#999] dark:text-gray-400 font-bold uppercase">{t.height}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-lg font-bold text-[#111] dark:text-white capitalize">{(detail.height || 0) / 10} m</Text>
                            </View>
                        </View>

                        <View className="w-[48%] border border-gray-200 dark:border-[#333] rounded-[20px] py-[15px] px-5 bg-white dark:bg-[#1A1A1A]">
                            <View className="flex-row items-center gap-1.5 mb-2">
                                <MaterialCommunityIcons name="view-grid-outline" size={16} color="#999" />
                                <Text className="text-[13px] text-[#999] dark:text-gray-400 font-bold uppercase">{t.category}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-lg font-bold text-[#111] dark:text-white capitalize">{detail.types[0]?.type.name || 'Seed'}</Text>
                            </View>
                        </View>

                        <View className="w-[48%] border border-gray-200 dark:border-[#333] rounded-[20px] py-[15px] px-5 bg-white dark:bg-[#1A1A1A]">
                            <View className="flex-row items-center gap-1.5 mb-2">
                                <MaterialCommunityIcons name="pokeball" size={16} color="#999" />
                                <Text className="text-[13px] text-[#999] dark:text-gray-400 font-bold uppercase">{t.abilities}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-lg font-bold text-[#111] dark:text-white capitalize">{detail.abilities?.[0]?.ability.name.replace('-', ' ') || 'Overgrow'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Gender section */}
                    {renderGender()}

                    {/* Base Stats */}
                    <Text className="text-xl font-black text-[#111] dark:text-white mb-[20px]">{t.stats}</Text>
                    <View className="mb-9">
                        {(() => {
                            const statMapping = [
                                { key: 'hp', label: t.hp, color: '#ff0000' },
                                { key: 'attack', label: t.attack, color: '#f08030' },
                                { key: 'defense', label: t.defense, color: '#f8d030' },
                                { key: 'special-attack', label: t.spAtk, color: '#6890f0' },
                                { key: 'special-defense', label: t.spDef, color: '#78c850' },
                                { key: 'speed', label: t.speed, color: '#f85888' },
                            ];

                            const total = detail.stats.reduce((acc, s) => acc + s.base_stat, 0);

                            return (
                                <>
                                    {statMapping.map((s) => {
                                        const statValue = detail.stats.find(os => os.stat.name === s.key)?.base_stat || 0;
                                        const percentage = Math.min(100, (statValue / 255) * 100);

                                        // Màu sắc động cho thanh progress
                                        const getBarColor = (val: number) => {
                                            if (val < 50) return '#ef4444'; // Red-500
                                            if (val < 90) return '#f59e0b'; // Amber-500
                                            if (val < 120) return '#22c55e'; // Green-500
                                            return '#3b82f6'; // Blue-500
                                        };

                                        return (
                                            <View key={s.key} className="flex-row items-center mb-3">
                                                <Text className="w-[100px] text-[14px] text-[#666] dark:text-gray-400 font-bold">{s.label}</Text>
                                                <Text className="w-[35px] text-[14px] text-[#333] dark:text-gray-200 font-black text-right mr-4">{statValue}</Text>
                                                <View className="flex-1 h-1.5 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                                                    <View
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: getBarColor(statValue)
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        );
                                    })}
                                    <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100 dark:border-[#222]">
                                        <Text className="w-[100px] text-[14px] text-[#111] dark:text-white font-black">{t.total}</Text>
                                        <Text className="w-[35px] text-[14px] text-[#111] dark:text-white font-black text-right mr-4">{total}</Text>
                                        <View className="flex-1 h-3" />
                                    </View>
                                </>
                            );
                        })()}
                    </View>

                    {/* Weaknesses */}
                    {detail.weaknesses && detail.weaknesses.length > 0 && (
                        <>
                            <Text className="text-xl font-black text-[#111] dark:text-white mb-[15px]">{t.weakness}</Text>
                            <View className="flex-row flex-wrap gap-2.5 mb-9">
                                {detail.weaknesses.map(w => {
                                    const wColor = getColorsByType(w);
                                    return (
                                        <TouchableOpacity
                                            key={w}
                                            onPress={() => {
                                                navigation.navigate('TypeResults', { type: w });
                                            }}
                                            className="px-2.5 py-1.5 rounded-[20px] flex-row items-center gap-1.5"
                                            style={{ backgroundColor: wColor }}
                                        >
                                            {TYPE_ICONS[w] && (
                                                <View className="w-[18px] h-[18px] rounded-full bg-white justify-center items-center">
                                                    <Image source={TYPE_ICONS[w]} style={{ width: 10, height: 10 }} contentFit="contain" />
                                                </View>
                                            )}
                                            <Text className="text-white text-[13px] font-bold capitalize">{w}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* Evolutions */}
                    {detail.evolutions && detail.evolutions.length > 0 && (
                        <>
                            <Text className="text-xl font-black text-[#111] dark:text-white mb-[15px]">{t.evolution}</Text>
                            <View className="border border-gray-200 dark:border-[#333] rounded-[24px] p-5 bg-white dark:bg-[#1A1A1A]">
                                {detail.evolutions.map((evo, index) => {
                                    const evolColor = getColorsByType(evo.types?.[0] || 'normal');

                                    return (
                                        <React.Fragment key={evo.name}>
                                            <TouchableOpacity
                                                className="flex-row items-center gap-[15px]"
                                                onPress={() => navigation.push('Detail', {
                                                    name: evo.name,
                                                    bgColor: evolColor
                                                })}
                                            >
                                                <View className="w-20 h-20 rounded-[40px] justify-center items-center overflow-hidden relative" style={{ backgroundColor: evolColor }}>
                                                    {TYPE_OUTLINE_ICONS[evo.types?.[0] || 'normal'] && (
                                                        <Image
                                                            source={TYPE_OUTLINE_ICONS[evo.types?.[0] || 'normal']}
                                                            style={{ position: 'absolute', width: 60, height: 60, opacity: 0.2 }}
                                                            contentFit="contain"
                                                        />
                                                    )}
                                                    {evo.imageUrl ? (
                                                        <Image source={{ uri: evo.imageUrl }} style={{ width: 65, height: 65, zIndex: 2 }} contentFit="contain" />
                                                    ) : null}
                                                </View>

                                                <View className="flex-1">
                                                    <Text className="text-lg font-bold text-[#111] dark:text-white capitalize mb-0.5">{evo.name}</Text>
                                                    <Text className="text-[13px] text-[#666] dark:text-gray-400 font-bold mb-1.5">
                                                        {evo.imageUrl
                                                            ? `#${evo.imageUrl.split('/').filter(Boolean).pop()?.replace('.png', '').padStart(3, '0')}`
                                                            : '---'
                                                        }
                                                    </Text>
                                                    <View className="flex-row gap-1.5 flex-wrap">
                                                        {evo.types?.map(t => (
                                                            <View key={t} className="flex-row items-center gap-[5px] px-2 py-1 rounded-[20px]" style={{ backgroundColor: getColorsByType(t) }}>
                                                                <View className="w-[18px] h-[18px] rounded-full bg-white justify-center items-center">
                                                                    {TYPE_ICONS[t] && <Image source={TYPE_ICONS[t]} style={{ width: 10, height: 10 }} contentFit="contain" />}
                                                                </View>
                                                                <Text className="text-white text-[11px] font-bold capitalize">{t}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>

                                            {index < detail.evolutions!.length - 1 ? (
                                                <View className="items-center my-2.5 ml-[25px]">
                                                    <MaterialCommunityIcons name="arrow-down-bold" size={32} color="#3b82f6" />
                                                    {detail.evolutions![index + 1]?.level ? (
                                                        <Text className="text-[14px] font-bold text-blue-500 mt-0.5">Lv. {detail.evolutions![index + 1].level}</Text>
                                                    ) : null}
                                                </View>
                                            ) : null}
                                        </React.Fragment>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
};
