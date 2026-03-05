import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { usePokemonStore } from '../store/usePokemonStore';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPE_ICONS, TYPE_OUTLINE_ICONS } from '../utils/typeIcons';
import { getColorsByType } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export const DetailScreen = ({ route, navigation }: Props) => {
    const { name, bgColor } = route.params;
    const { pokemonDetails, loadPokemonDetail } = usePokemonStore();
    const detail = pokemonDetails[name];

    useEffect(() => {
        loadPokemonDetail(name);
    }, [name]);

    if (!detail || !detail.id) {
        return (
            <SafeAreaView style={[styles.center, { backgroundColor: bgColor }]}>
                <ActivityIndicator size="large" color="#fff" />
            </SafeAreaView>
        );
    }

    const formattedId = `N°${detail.id.toString().padStart(3, '0')}`;
    const imageUrl = detail.sprites?.other?.['official-artwork']?.front_default || detail.sprites?.front_default || '';

    // Render tỷ lệ giới tính gộp 2 màu
    const renderGender = () => {
        if (detail.genderRate === undefined || detail.genderRate === -1) {
            return (
                <View style={styles.genderContainer}>
                    <Text style={styles.genderLabelCenter}>GÊNERO</Text>
                    <Text style={{ textAlign: 'center', color: '#666', fontWeight: 'bold' }}>Genderless</Text>
                </View>
            );
        }
        const femaleRatio = (detail.genderRate / 8) * 100;
        const maleRatio = 100 - femaleRatio;
        return (
            <View style={styles.genderContainer}>
                <Text style={styles.genderLabelCenter}>GÊNERO</Text>
                <View style={styles.genderBarWrapper}>
                    <View style={[styles.genderBarMale, { width: `${maleRatio}%` }]} />
                    <View style={[styles.genderBarFemale, { width: `${femaleRatio}%` }]} />
                </View>
                <View style={styles.genderLabels}>
                    <Text style={styles.genderTextLine}>♂ {maleRatio.toString().replace('.', ',')}%</Text>
                    <Text style={styles.genderTextLine}>♀ {femaleRatio.toString().replace('.', ',')}%</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Vòng nền Header cong cực lớn */}
            <View style={styles.headerOverflow}>
                <View style={[styles.headerCurveBg, { backgroundColor: bgColor }]}>
                    {TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal'] && (
                        <Image
                            source={TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal']}
                            style={styles.watermarkIcon}
                            contentFit="contain"
                        />
                    )}
                </View>
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={32} color="#fff" />
                    </TouchableOpacity>
                    {/* Đã bỏ nút Favorite Heart theo yêu cầu */}
                </View>

                {/* Avatar lấn chiếm cạnh viền */}
                <View style={styles.imageWrapper}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            contentFit="contain"
                            transition={500}
                        />
                    ) : null}
                </View>

                <View style={styles.contentWrapper}>
                    <ScrollView
                        style={styles.contentContainer}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Title Block Layout (Trái) */}
                        <Text style={styles.name}>{detail.name}</Text>
                        <Text style={styles.idText}>{formattedId}</Text>

                        {/* Types */}
                        <View style={styles.typesRow}>
                            {detail.types?.map((t) => (
                                <View key={t.type.name} style={[styles.typeBadge, { backgroundColor: getColorsByType(t.type.name) }]}>
                                    {TYPE_ICONS[t.type.name] && (
                                        <View style={styles.iconCircle}>
                                            <Image source={TYPE_ICONS[t.type.name]} style={styles.detailTypeIcon} contentFit="contain" />
                                        </View>
                                    )}
                                    <Text style={styles.typeText}>{t.type.name}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Description */}
                        {detail.description ? (
                            <Text style={styles.descriptionText}>{detail.description}</Text>
                        ) : null}

                        {/* Stats 2x2 Grid Layout */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                                <View style={styles.statBoxHeader}>
                                    <MaterialCommunityIcons name="weight" size={16} color="#999" />
                                    <Text style={styles.statBoxTitle}>PESO</Text>
                                </View>
                                <View style={styles.statBoxValueContainer}>
                                    <Text style={styles.statBoxValue}>{(detail.weight || 0) / 10} kg</Text>
                                </View>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statBoxHeader}>
                                    <MaterialCommunityIcons name="format-line-spacing" size={16} color="#999" />
                                    <Text style={styles.statBoxTitle}>ALTURA</Text>
                                </View>
                                <View style={styles.statBoxValueContainer}>
                                    <Text style={styles.statBoxValue}>{(detail.height || 0) / 10} m</Text>
                                </View>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statBoxHeader}>
                                    <MaterialCommunityIcons name="view-grid-outline" size={16} color="#999" />
                                    <Text style={styles.statBoxTitle}>CATEGORIA</Text>
                                </View>
                                <View style={styles.statBoxValueContainer}>
                                    <Text style={styles.statBoxValue}>{detail.types[0]?.type.name || 'Seed'}</Text>
                                </View>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statBoxHeader}>
                                    <MaterialCommunityIcons name="pokeball" size={16} color="#999" />
                                    <Text style={styles.statBoxTitle}>HABILIDADE</Text>
                                </View>
                                <View style={styles.statBoxValueContainer}>
                                    <Text style={styles.statBoxValue}>{detail.abilities?.[0]?.ability.name.replace('-', ' ') || 'Overgrow'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Gender section */}
                        {renderGender()}

                        {/* Weaknesses */}
                        {detail.weaknesses && detail.weaknesses.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Fraquezas</Text>
                                <View style={styles.weaknessContainer}>
                                    {detail.weaknesses.map(w => {
                                        const wColor = getColorsByType(w);
                                        return (
                                            <View key={w} style={[styles.weakBadge, { backgroundColor: wColor }]}>
                                                {TYPE_ICONS[w] && (
                                                    <View style={styles.iconCircleSmall}>
                                                        <Image source={TYPE_ICONS[w]} style={styles.detailTypeIconSmall} contentFit="contain" />
                                                    </View>
                                                )}
                                                <Text style={styles.weakText}>{w}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </>
                        )}

                        {/* Evolutions */}
                        {detail.evolutions && detail.evolutions.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Evoluções</Text>
                                <View style={styles.evoCardContainer}>
                                    {detail.evolutions.map((evo, index) => {
                                        const mainBg = getColorsByType(detail.types?.[0]?.type.name || 'normal');

                                        return (
                                            <React.Fragment key={evo.name}>
                                                <View style={styles.evoRowItem}>
                                                    <View style={[styles.evoImageHolder, { backgroundColor: mainBg }]}>
                                                        {TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal'] && (
                                                            <Image
                                                                source={TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal']}
                                                                style={styles.evoWatermark}
                                                                contentFit="contain"
                                                            />
                                                        )}
                                                        {evo.imageUrl ? (
                                                            <Image source={{ uri: evo.imageUrl }} style={styles.evoImage} contentFit="contain" />
                                                        ) : null}
                                                    </View>

                                                    <View style={styles.evoInfo}>
                                                        <Text style={styles.evoName}>{evo.name}</Text>
                                                        <Text style={styles.evoIdText}>N°{evo.level ? '---' : '001'} (Evol)</Text>
                                                        <View style={styles.evoTypes}>
                                                            {detail.types?.map(t => (
                                                                <View key={t.type.name} style={[styles.evoTypeMini, { backgroundColor: getColorsByType(t.type.name) }]}>
                                                                    {TYPE_ICONS[t.type.name] && <Image source={TYPE_ICONS[t.type.name]} style={styles.evoTypeIconMini} contentFit="contain" />}
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </View>
                                                </View>

                                                {index < detail.evolutions!.length - 1 && (
                                                    <View style={styles.evoArrowLevel}>
                                                        <MaterialCommunityIcons name="arrow-down-bold" size={32} color="#1D4ED8" />
                                                        {detail.evolutions![index + 1]?.level && (
                                                            <Text style={styles.evoLevelText}>Nível {detail.evolutions![index + 1].level}</Text>
                                                        )}
                                                    </View>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </View>
                            </>
                        )}
                        <View style={{ height: 100 }} /> {/* Đệm đáy */}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header Curved Background Layout
    headerOverflow: {
        height: Platform.OS === 'ios' ? 240 : 260,
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 0,
        overflow: 'hidden',
    },
    headerCurveBg: {
        width: '150%',
        height: 380,
        borderBottomLeftRadius: 300,
        borderBottomRightRadius: 300,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -60,
    },
    watermarkIcon: { width: 280, height: 280, position: 'absolute', opacity: 0.15, bottom: 40 },

    safeArea: { flex: 1, zIndex: 1 },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: Platform.OS === 'ios' ? 10 : 30,
        zIndex: 5,
    },
    backButton: { padding: 5 },

    // Avatar Overlapping Curve
    imageWrapper: { alignItems: 'center', justifyContent: 'center', zIndex: 5, marginTop: -10, marginBottom: -30, height: 200 },
    image: { width: 220, height: 220, zIndex: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10 },

    // Scrollable Body Frame
    contentWrapper: { flex: 1, zIndex: 2 },
    contentContainer: { flex: 1 },
    scrollContent: { paddingTop: 20, paddingHorizontal: 25, paddingBottom: 60 },

    // Header texts (Trái)
    name: { fontSize: 36, fontWeight: '900', color: '#111', textTransform: 'capitalize' },
    idText: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 15, marginTop: 2 },
    typesRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    typeBadge: { borderRadius: 24, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
    iconCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    typeText: { color: '#fff', fontSize: 13, fontWeight: 'bold', textTransform: 'capitalize' },
    detailTypeIcon: { width: 12, height: 12 },

    // Desc
    descriptionText: { fontSize: 15, color: '#555', lineHeight: 22, textAlign: 'justify', marginBottom: 30 },

    // Stats 2x2 Grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 25 },
    statBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff'
    },
    statBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    statBoxTitle: { fontSize: 13, color: '#999', fontWeight: 'bold' },
    statBoxValueContainer: { alignItems: 'center' },
    statBoxValue: { fontSize: 18, fontWeight: 'bold', color: '#111', textTransform: 'capitalize' },

    // Gender
    genderContainer: { flexDirection: 'column', width: '100%', marginBottom: 35 },
    genderLabelCenter: { fontSize: 14, color: '#666', fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    genderBarWrapper: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    genderBarMale: { backgroundColor: '#3B82F6', height: '100%' },
    genderBarFemale: { backgroundColor: '#F472B6', height: '100%' },
    genderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    genderTextLine: { fontSize: 13, color: '#444', fontWeight: 'bold' },

    // Fraquezas List
    sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 15 },
    weaknessContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 35 },
    weakBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
    iconCircleSmall: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    detailTypeIconSmall: { width: 10, height: 10 },
    weakText: { color: '#fff', fontSize: 13, fontWeight: 'bold', textTransform: 'capitalize' },

    // Evo Chain Card
    evoCardContainer: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 24,
        padding: 20,
        backgroundColor: '#fff',
    },
    evoRowItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    evoImageHolder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
    evoWatermark: { width: 60, height: 60, position: 'absolute', opacity: 0.2 },
    evoImage: { width: 65, height: 65, zIndex: 2 },
    evoInfo: { flex: 1 },
    evoName: { fontSize: 18, fontWeight: 'bold', color: '#111', textTransform: 'capitalize', marginBottom: 2 },
    evoIdText: { fontSize: 13, color: '#666', fontWeight: 'bold', marginBottom: 6 },
    evoTypes: { flexDirection: 'row', gap: 5 },
    evoTypeMini: { width: 24, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
    evoTypeIconMini: { width: 8, height: 8 },
    evoArrowLevel: { alignItems: 'center', marginVertical: 10, marginLeft: 25 },
    evoLevelText: { fontSize: 14, fontWeight: 'bold', color: '#1D4ED8', marginTop: 2 }
});
