import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useColorScheme } from 'nativewind';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const { width } = Dimensions.get('window');

export const SplashScreen = ({ navigation }: Props) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.75)).current;
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        // Fade + scale in animation
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                bounciness: 10,
                speed: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate to Home after 2.2 seconds
        const timer = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                navigation.replace('MainTabs', { screen: 'Pokedex' });
            });
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View className="flex-1 bg-white dark:bg-black justify-center items-center">
            {/* Subtle Pokeball watermark in background */}
            <Image
                source={isDark ? require('../../assets/Pokedex-light.png') : require('../../assets/Pokedex.png')}
                style={{ position: 'absolute', width: width * 1.1, height: width * 1.1, opacity: isDark ? 0.08 : 0.04 }}
                contentFit="contain"
            />

            <Animated.View style={[{ opacity, transform: [{ scale }] }]} className="items-center justify-center">
                <Image
                    source={isDark ? require('../../assets/Pokedex-light.png') : require('../../assets/Pokedex.png')}
                    style={{ width: 220, height: 220 }}
                    contentFit="contain"
                />
            </Animated.View>
        </View>
    );
};
