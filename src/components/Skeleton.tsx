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
