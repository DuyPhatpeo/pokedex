import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const { width, height } = Dimensions.get('window');

export const SplashScreen = ({ navigation }: Props) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.75)).current;

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
        <View style={styles.container}>
            {/* Subtle Pokeball watermark in background */}
            <Image
                source={require('../../assets/Pokedex.png')}
                style={styles.bgWatermark}
                contentFit="contain"
            />

            <Animated.View style={[styles.logoWrapper, { opacity, transform: [{ scale }] }]}>
                <Image
                    source={require('../../assets/Pokedex.png')}
                    style={styles.logo}
                    contentFit="contain"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgWatermark: {
        position: 'absolute',
        width: width * 1.1,
        height: width * 1.1,
        opacity: 0.04,
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 220,
        height: 220,
    },
});
