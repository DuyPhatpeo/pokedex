import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props {
    height?: number;
    width?: string | number;
    borderRadius?: number;
    style?: object;
}

export const SkeletonBox = ({ height = 20, width = '100%', borderRadius = 8, style }: Props) => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };
        animate();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.85],
    });

    return (
        <Animated.View
            style={[
                styles.box,
                { height, width: width as any, borderRadius, opacity },
                style,
            ]}
        />
    );
};

// ---------- Skeleton Card for PokemonCard ----------
export const SkeletonCard = () => {
    return (
        <View style={styles.card}>
            <View style={styles.leftInfo}>
                <SkeletonBox height={14} width={50} borderRadius={6} />
                <SkeletonBox height={22} width={130} borderRadius={8} style={{ marginTop: 8 }} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                    <SkeletonBox height={26} width={70} borderRadius={20} />
                    <SkeletonBox height={26} width={70} borderRadius={20} />
                </View>
            </View>
            <SkeletonBox height={100} width={100} borderRadius={16} />
        </View>
    );
};

// ---------- Skeleton Detail Screen ----------
export const SkeletonDetailScreen = ({ bgColor }: { bgColor: string }) => {
    return (
        <View style={{ flex: 1, backgroundColor: bgColor }}>
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
                <SkeletonBox height={14} width={50} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.4)', marginBottom: 12 }} />
                <SkeletonBox height={38} width={200} borderRadius={10} style={{ backgroundColor: 'rgba(255,255,255,0.4)', marginBottom: 14 }} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <SkeletonBox height={30} width={90} borderRadius={20} style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
                    <SkeletonBox height={30} width={90} borderRadius={20} style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
                </View>
            </View>

            {/* Avatar placeholder */}
            <View style={{ alignItems: 'center', marginBottom: -70, zIndex: 10 }}>
                <SkeletonBox height={160} width={160} borderRadius={80} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
            </View>

            {/* White body */}
            <View style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingHorizontal: 24, paddingTop: 90 }}>
                {/* Description */}
                <SkeletonBox height={14} width="100%" borderRadius={6} style={{ marginBottom: 8 }} />
                <SkeletonBox height={14} width="85%" borderRadius={6} style={{ marginBottom: 24 }} />

                {/* Stat boxes */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonBox key={i} height={70} width="48%" borderRadius={16} />
                    ))}
                </View>

                {/* Gender */}
                <SkeletonBox height={14} width={80} borderRadius={6} style={{ marginBottom: 10 }} />
                <SkeletonBox height={12} width="100%" borderRadius={6} style={{ marginBottom: 24 }} />

                {/* Weaknesses */}
                <SkeletonBox height={22} width={120} borderRadius={8} style={{ marginBottom: 14 }} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonBox key={i} height={30} width={80} borderRadius={20} />
                    ))}
                </View>

                {/* Evolutions */}
                <SkeletonBox height={22} width={120} borderRadius={8} style={{ marginBottom: 14 }} />
                <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                    <SkeletonBox height={80} width={80} borderRadius={40} />
                    <SkeletonBox height={32} width={32} borderRadius={16} />
                    <SkeletonBox height={80} width={80} borderRadius={40} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        backgroundColor: '#d0d0d0',
    },
    card: {
        borderRadius: 28,
        marginVertical: 10,
        marginHorizontal: 15,
        height: 140,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'space-between',
    },
    leftInfo: {
        flex: 1,
        paddingRight: 12,
    },
});
