import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { usePokemonStore } from '../store/usePokemonStore';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPE_ICONS, TYPE_OUTLINE_ICONS } from '../utils/typeIcons';
import { getColorsByType, hexToRgba } from '../utils/colors';
import { SkeletonDetailScreen } from '../components/Skeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;
const { width } = Dimensions.get('window');

export const DetailScreen = ({ route, navigation }: Props) => {
    const { name, bgColor } = route.params;
    const { pokemonDetails, loadPokemonDetail } = usePokemonStore();
    const detail = pokemonDetails[name];

    useEffect(() => {
        loadPokemonDetail(name);
    }, [name]);

    if (!detail || !detail.id) {
        return <SkeletonDetailScreen bgColor={bgColor} />;
    }

    const formattedId = `#${detail.id.toString().padStart(3, '0')}`;
    const imageUrl = detail.sprites?.other?.['official-artwork']?.front_default || detail.sprites?.front_default || '';

    // Render tỷ lệ giới tính gộp 2 màu
    const renderGender = () => {
        if (detail.genderRate === undefined || detail.genderRate === -1) {
            return (
                <View style={styles.genderContainer}>
                    <Text style={styles.genderLabelCenter}>GENDER</Text>
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
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {/* 
              Giữ duy nhất 1 ScrollView tổng bao vây tất cả. 
              Nhờ vậy khi cuộn, Card Header và Image chạy lên cùng đợt với List, không bị hiện tượng Overlay.
            */}
            <ScrollView
                style={styles.fullScroll}
                contentContainerStyle={styles.fullScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* 
                  =============== PHẦN HEADER DÀNH CHO WATERMARK VÀ TIÊU ĐỀ ===============
                */}
                <View style={[styles.topHeaderSection, { backgroundColor: bgColor }]}>
                    {/* Background Pattern Tĩnh (Mờ Nhạt Icon Thuộc Tính) */}
                    {TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal'] && (
                        <Image
                            source={TYPE_OUTLINE_ICONS[detail.types?.[0]?.type.name || 'normal']}
                            style={styles.bgPokeball}
                            contentFit="contain"
                        />
                    )}

                    {/* Navigation Bar */}
                    <SafeAreaView style={styles.safeAreaHeader}>
                        <View style={styles.headerNav}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={28} color="#fff" />
                            </TouchableOpacity>
                            {/* Bỏ Heart theo yêu cầu */}
                        </View>
                    </SafeAreaView>

                    {/* Title Box */}
                    <View style={styles.titleContainer}>
                        <View style={styles.titleRow}>
                            <Text style={styles.name}>{detail.name}</Text>
                            <Text style={styles.idText}>{formattedId}</Text>
                        </View>

                        {/* Types Layout New Design */}
                        <View style={styles.typesRow}>
                            {detail.types?.map((t) => (
                                <View key={t.type.name} style={[styles.typeBadgeFlat, { backgroundColor: hexToRgba(getColorsByType(t.type.name), 0.75) }]}>
                                    {TYPE_ICONS[t.type.name] && (
                                        <View style={styles.typeBadgeIconCircle}>
                                            <Image source={TYPE_ICONS[t.type.name]} style={styles.typeBadgeIcon} contentFit="contain" />
                                        </View>
                                    )}
                                    <Text style={styles.typeTextFlat}>{t.type.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Pokemon Avatar Container lồi xuống (Nằm trọn trong luồng Flex Scroll) */}
                    <View style={styles.avatarHolder}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.avatarImage}
                                contentFit="contain"
                                transition={500}
                            />
                        ) : null}
                    </View>
                </View>

                {/* 
                  =============== PHẦN BODY MÀU TRẮNG HIỂN THỊ DỮ LIỆU ===============
                */}
                <View style={styles.whiteBodyCurve}>
                    {/* Thêm khoảng trống đẩy phần thông tin xuống vì Avatar đã tràn dính qua viền cong bằng âm margin-top */}
                    <View style={styles.bodySpacer} />

                    {/* Description */}
                    {detail.description ? (
                        <Text style={styles.descriptionText}>{detail.description}</Text>
                    ) : null}

                    {/* Stats 2x2 Grid Layout */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <View style={styles.statBoxHeader}>
                                <MaterialCommunityIcons name="weight" size={16} color="#999" />
                                <Text style={styles.statBoxTitle}>WEIGHT</Text>
                            </View>
                            <View style={styles.statBoxValueContainer}>
                                <Text style={styles.statBoxValue}>{(detail.weight || 0) / 10} kg</Text>
                            </View>
                        </View>

                        <View style={styles.statBox}>
                            <View style={styles.statBoxHeader}>
                                <MaterialCommunityIcons name="format-line-spacing" size={16} color="#999" />
                                <Text style={styles.statBoxTitle}>HEIGHT</Text>
                            </View>
                            <View style={styles.statBoxValueContainer}>
                                <Text style={styles.statBoxValue}>{(detail.height || 0) / 10} m</Text>
                            </View>
                        </View>

                        <View style={styles.statBox}>
                            <View style={styles.statBoxHeader}>
                                <MaterialCommunityIcons name="view-grid-outline" size={16} color="#999" />
                                <Text style={styles.statBoxTitle}>CATEGORY</Text>
                            </View>
                            <View style={styles.statBoxValueContainer}>
                                <Text style={styles.statBoxValue}>{detail.types[0]?.type.name || 'Seed'}</Text>
                            </View>
                        </View>

                        <View style={styles.statBox}>
                            <View style={styles.statBoxHeader}>
                                <MaterialCommunityIcons name="pokeball" size={16} color="#999" />
                                <Text style={styles.statBoxTitle}>ABILITY</Text>
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
                            <Text style={styles.sectionTitle}>Weaknesses</Text>
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
                            <Text style={styles.sectionTitle}>Evolutions</Text>
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
                                                    <Text style={styles.evoIdText}>
                                                        {evo.imageUrl
                                                            ? `#${evo.imageUrl.split('/').filter(Boolean).pop()?.replace('.png', '').padStart(3, '0')}`
                                                            : '---'
                                                        }
                                                    </Text>
                                                    <View style={styles.evoTypes}>
                                                        {detail.types?.map(t => (
                                                            <View key={t.type.name} style={[styles.evoTypeMini, { backgroundColor: getColorsByType(t.type.name) }]}>
                                                                <View style={styles.evoTypeIconCircle}>
                                                                    {TYPE_ICONS[t.type.name] && <Image source={TYPE_ICONS[t.type.name]} style={styles.evoTypeIconMini} contentFit="contain" />}
                                                                </View>
                                                                <Text style={styles.evoTypeText}>{t.type.name}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>

                                            {index < detail.evolutions!.length - 1 ? (
                                                <View style={styles.evoArrowLevel}>
                                                    <MaterialCommunityIcons name="arrow-down-bold" size={32} color="#1D4ED8" />
                                                    {detail.evolutions![index + 1]?.level ? (
                                                        <Text style={styles.evoLevelText}>Lv. {detail.evolutions![index + 1].level}</Text>
                                                    ) : null}
                                                </View>
                                            ) : null}
                                        </React.Fragment>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Tổng quản lý cuộn
    fullScroll: { flex: 1 },
    fullScrollContent: { paddingBottom: 0 },

    // Khối xanh ở Top
    topHeaderSection: {
        width: '100%',
        paddingBottom: 20, // Dự trữ chút cho nửa thân dưới Body Trắng đè lên
        position: 'relative',
        zIndex: 5,
    },
    bgPokeball: {
        position: 'absolute',
        width: 280,
        height: 280,
        right: -80,
        bottom: -20,
        opacity: 0.1,
    },
    safeAreaHeader: {
        paddingTop: Platform.OS === 'ios' ? 10 : 35,
    },
    headerNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    backButton: { padding: 5 },

    // Title Khối
    titleContainer: {
        paddingHorizontal: 25,
        marginTop: 5,
        marginBottom: 15, // Tạo khoảng cách cho avatar bung
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    name: {
        fontSize: 38,
        fontWeight: '900',
        color: '#fff',
        textTransform: 'capitalize',
        flex: 1,
    },
    idText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    typesRow: {
        flexDirection: 'row',
        gap: 10,
    },
    typeBadgeFlat: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    typeBadgeIconCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeBadgeIcon: {
        width: 14,
        height: 14,
    },
    typeTextFlat: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },

    // Avatar Wrapper (Giao thoa trên đường ranh giới trắng xanh)
    avatarHolder: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
        zIndex: 10,
        marginBottom: -80,
    },
    avatarImage: {
        width: 240,
        height: 240,
        zIndex: 10,
    },

    // KHỐI CONTENT MÀU TRẮNG
    whiteBodyCurve: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingHorizontal: 25,
        paddingBottom: 60,
        marginTop: 0,
        zIndex: 1,
        minHeight: '60%',
        flex: 1,
    },
    bodySpacer: {
        height: 90,
    },

    // Description & Fonts
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
    evoTypes: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    evoTypeMini: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    evoTypeIconCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    evoTypeIconMini: { width: 10, height: 10 },
    evoTypeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
    evoArrowLevel: { alignItems: 'center', marginVertical: 10, marginLeft: 25 },
    evoLevelText: { fontSize: 14, fontWeight: 'bold', color: '#1D4ED8', marginTop: 2 }
});
