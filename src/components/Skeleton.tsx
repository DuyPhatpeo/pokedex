import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

interface Props {
    height?: number;
    width?: string | number;
    borderRadius?: number;
    style?: object;
    className?: string; // Add className prop for nativewind
}

export const SkeletonBox = ({ height = 20, width = '100%', borderRadius = 8, style, className = '' }: Props) => {
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
            className={`bg-[#d0d0d0] ${className}`}
            style={[
                { height, width: width as any, borderRadius, opacity },
                style,
            ]}
        />
    );
};

// ---------- Skeleton Card for PokemonCard ----------
export const SkeletonCard = () => {
    return (
        <View className="rounded-[28px] my-[10px] mx-[15px] h-[140px] flex-row items-center px-[20px] bg-[#f0f0f0] justify-between">
            <View className="flex-1 pr-3">
                <SkeletonBox height={14} width={50} borderRadius={6} />
                <SkeletonBox height={22} width={130} borderRadius={8} className="mt-2" />
                <View className="flex-row gap-2 mt-[14px]">
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
        <View className="flex-1" style={{ backgroundColor: bgColor }}>
            {/* Header */}
            <View className="px-6 pt-[60px] pb-5">
                <SkeletonBox height={14} width={50} borderRadius={6} className="bg-white/40 mb-3" />
                <SkeletonBox height={38} width={200} borderRadius={10} className="bg-white/40 mb-[14px]" />
                <View className="flex-row gap-2.5">
                    <SkeletonBox height={30} width={90} borderRadius={20} className="bg-white/35" />
                    <SkeletonBox height={30} width={90} borderRadius={20} className="bg-white/35" />
                </View>
            </View>

            {/* Avatar placeholder */}
            <View className="items-center -mb-[70px] z-10">
                <SkeletonBox height={160} width={160} borderRadius={80} className="bg-white/30" />
            </View>

            {/* White body */}
            <View className="flex-1 bg-white rounded-t-[50px] px-6 pt-[90px]">
                {/* Description */}
                <SkeletonBox height={14} width="100%" borderRadius={6} className="mb-2" />
                <SkeletonBox height={14} width="85%" borderRadius={6} className="mb-6" />

                {/* Stat boxes */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonBox key={i} height={70} width="48%" borderRadius={16} />
                    ))}
                </View>

                {/* Gender */}
                <SkeletonBox height={14} width={80} borderRadius={6} className="mb-2.5" />
                <SkeletonBox height={12} width="100%" borderRadius={6} className="mb-6" />

                {/* Weaknesses */}
                <SkeletonBox height={22} width={120} borderRadius={8} className="mb-[14px]" />
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <SkeletonBox key={i} height={30} width={80} borderRadius={20} />
                    ))}
                </View>

                {/* Evolutions */}
                <SkeletonBox height={22} width={120} borderRadius={8} className="mb-[14px]" />
                <View className="flex-row gap-[14px] items-center">
                    <SkeletonBox height={80} width={80} borderRadius={40} />
                    <SkeletonBox height={32} width={32} borderRadius={16} />
                    <SkeletonBox height={80} width={80} borderRadius={40} />
                </View>
            </View>
        </View>
    );
};
