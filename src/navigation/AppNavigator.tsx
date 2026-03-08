import React from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { RootStackParamList, MainTabParamList } from './types';
import { useTranslation } from '../i18n/translations';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS = [
    { name: 'Pokedex', activeIcon: 'pokeball', inactiveIcon: 'pokeball', family: 'mci' },
    { name: 'Search', activeIcon: 'search', inactiveIcon: 'search-outline', family: 'ion' },
    { name: 'Favorites', activeIcon: 'heart', inactiveIcon: 'heart-outline', family: 'ion' },
    { name: 'Settings', activeIcon: 'settings', inactiveIcon: 'settings-outline', family: 'ion' },
] as const;

const ACTIVE_COLOR = '#e3350d';
const ACTIVE_COLOR_DARK = '#f87171';

const PokeballIcon = ({ focused, isDark, size = 26 }: { focused: boolean, isDark: boolean, size?: number }) => {
    const inactiveColor = isDark ? '#6b7280' : '#a3a3a3';

    if (!focused) {
        // Inactive: looks like a normal icon — just border + divider + dot, all in gray
        const c = inactiveColor;
        return (
            <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: c, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'transparent', borderBottomWidth: 2, borderBottomColor: c }} />
                <View style={{ position: 'absolute', width: size * 0.38, height: size * 0.38, borderRadius: size, borderWidth: 2, borderColor: c, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: size * 0.1, height: size * 0.1, borderRadius: size, backgroundColor: c }} />
                </View>
            </View>
        );
    }

    // Active: red top, white bottom, dark border
    const borderColor = isDark ? '#fff' : '#111';
    const bottomColor = isDark ? '#000' : '#fff';
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: '#ef4444', borderBottomWidth: 2, borderBottomColor: borderColor }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: bottomColor }} />
            <View style={{ position: 'absolute', width: size * 0.38, height: size * 0.38, borderRadius: size, borderWidth: 2, borderColor, backgroundColor: bottomColor, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: size * 0.12, height: size * 0.12, borderRadius: size, backgroundColor: borderColor }} />
            </View>
        </View>
    );
};

const AnimatedTabIcon = ({ tab, isFocused, isDark, currentActiveColor }: any) => {
    const iconColor = isFocused ? currentActiveColor : (isDark ? '#6b7280' : '#a3a3a3');

    if (tab.name === 'Pokedex') {
        return <PokeballIcon focused={isFocused} isDark={isDark} size={28} />;
    }

    if (tab.family === 'ion') {
        const name = isFocused ? tab.activeIcon : tab.inactiveIcon;
        return <Ionicons name={name as any} size={28} color={iconColor} />;
    }

    return <MaterialCommunityIcons name={tab.activeIcon as any} size={28} color={iconColor} />;
};

const TabItem = ({ tab, isFocused, onPress, isDark, label, currentActiveColor }: any) => {
    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: withSpring(isFocused ? -8 : 0, { damping: 12, stiffness: 150 }) },
            { scale: withSpring(isFocused ? 1.15 : 1, { damping: 12, stiffness: 150 }) }
        ]
    }));

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="flex-1 items-center justify-center min-h-[58px]"
        >
            <Animated.View style={animatedIconStyle}>
                <AnimatedTabIcon tab={tab} isFocused={isFocused} isDark={isDark} currentActiveColor={currentActiveColor} />
            </Animated.View>

            {isFocused && (
                <Text style={{ fontSize: 11, color: currentActiveColor, fontWeight: '700', position: 'absolute', bottom: 4 }}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const currentActiveColor = isDark ? ACTIVE_COLOR_DARK : ACTIVE_COLOR;

    const getTabLabel = (name: string) => {
        if (name === 'Pokedex') return t.tabPokedex;
        if (name === 'Search') return t.tabSearch;
        if (name === 'Favorites') return t.tabFavorites;
        if (name === 'Settings') return t.tabSettings;
        return name;
    }

    return (
        <View
            className="flex-row bg-white dark:bg-black border-t border-[#eee] dark:border-[#222] pt-[8px]"
            style={[
                { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
                Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: isDark ? 0.2 : 0.05,
                        shadowRadius: 6,
                    },
                    android: { elevation: isDark ? 0 : 8 },
                })
            ]}
        >
            {TAB_ITEMS.map((tab, index) => {
                const isFocused = state.index === index;
                const onPress = () => {
                    if (!isFocused) navigation.navigate(tab.name as any);
                };

                return (
                    <TabItem
                        key={tab.name}
                        tab={tab}
                        isFocused={isFocused}
                        onPress={onPress}
                        isDark={isDark}
                        label={getTabLabel(tab.name)}
                        currentActiveColor={currentActiveColor}
                    />
                );
            })}
        </View>
    );
};

const MainTabs = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Pokedex" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ animation: 'fade' }}
                />
                <Stack.Screen
                    name="Detail"
                    component={DetailScreen}
                    options={{ animation: 'slide_from_right' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
