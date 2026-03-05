import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { usePokemonStore } from '../store/usePokemonStore';
import { PokemonListItem } from '../types/pokemon';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { TYPE_ICONS, TYPE_OUTLINE_ICONS } from '../utils/typeIcons';

interface Props {
    item: PokemonListItem;
    onPress: (name: string, bgColor: string) => void;
}

export const PokemonCard = memo(({ item, onPress }: Props) => {
    const { pokemonDetails, loadPokemonDetail } = usePokemonStore();
    const detail = pokemonDetails[item.name];

    useEffect(() => {
        loadPokemonDetail(item.name);
    }, [item.name]);

    if (!detail) {
        return (
            <View style={[styles.card, styles.loadingCard]}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    }

    const mainType = detail.types[0]?.type.name || 'normal';
    const bgColor = getColorsByType(mainType);
    const lightBgColor = hexToRgba(bgColor, 0.15); // Nền màu nhạt 15% opacity

    const formattedId = `N°${detail.id.toString().padStart(3, '0')}`;
    const imageUrl = detail.sprites.other?.['official-artwork'].front_default || detail.sprites.front_default;

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: lightBgColor }]}
            onPress={() => onPress(item.name, bgColor)}
            activeOpacity={0.9}
        >
            {/* Right dark background shape */}
            <View style={[styles.rightBgShape, { backgroundColor: bgColor }]}>
                {TYPE_OUTLINE_ICONS[mainType] && (
                    <Image
                        source={TYPE_OUTLINE_ICONS[mainType]}
                        style={styles.watermarkIcon}
                        contentFit="contain"
                    />
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.id}>{formattedId}</Text>
                <Text style={styles.name} numberOfLines={1}>{detail.name}</Text>
                <View style={styles.typesContainer}>
                    {detail.types.map((t) => (
                        <View key={t.type.name} style={[styles.typeBadge, { backgroundColor: getColorsByType(t.type.name) }]}>
                            {TYPE_ICONS[t.type.name] && (
                                <View style={styles.iconCircle}>
                                    <Image source={TYPE_ICONS[t.type.name]} style={styles.typeIcon} contentFit="contain" />
                                </View>
                            )}
                            <Text style={styles.typeText}>{t.type.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="contain"
                    transition={500}
                />
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        marginVertical: 10,
        marginHorizontal: 15,
        height: 140, // Height cố định tránh lộn xộn
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        overflow: 'hidden', // Che đi phần dư của mảng màu phải
        position: 'relative',
    },
    loadingCard: {
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightBgShape: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '38%',
        borderTopLeftRadius: 60, // Bo sóng hình cung
        borderBottomLeftRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    watermarkIcon: {
        width: 120,
        height: 120,
        opacity: 0.2, // Icon chìm
        position: 'absolute',
        right: -10,
    },
    infoContainer: {
        flex: 1,
        zIndex: 2,
    },
    id: {
        fontSize: 15,
        color: '#555',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    name: {
        fontSize: 26,
        fontWeight: '900', // Bold title
        color: '#111',
        textTransform: 'capitalize',
        marginBottom: 15,
    },
    typesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeBadge: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 4,
    },
    iconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeIcon: {
        width: 14,
        height: 14,
    },
    typeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginRight: 6,
    },
    imageContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
        position: 'absolute',
        right: 15,
        top: 10,
    },
    image: {
        width: 110,
        height: 110,
    }
});
