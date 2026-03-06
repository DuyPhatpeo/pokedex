import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
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
import { RootStackParamList, MainTabParamList } from './types';
import { useTranslation } from '../i18n/translations';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS = [
    { name: 'Pokedex', activeIcon: 'pokeball', inactiveIcon: 'pokeball', family: 'mci' },
    { name: 'Favorites', activeIcon: 'heart', inactiveIcon: 'heart-outline', family: 'ion' },
    { name: 'Settings', activeIcon: 'settings', inactiveIcon: 'settings-outline', family: 'ion' },
] as const;

const ACTIVE_COLOR = '#e3350d';
const ACTIVE_COLOR_DARK = '#f87171';

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const currentActiveColor = isDark ? ACTIVE_COLOR_DARK : ACTIVE_COLOR;

    const getTabLabel = (name: string) => {
        if (name === 'Pokedex') return t.tabPokedex;
        if (name === 'Favorites') return t.tabFavorites;
        if (name === 'Settings') return t.tabSettings;
        return name;
    }

    return (
        <View
            className="flex-row bg-white dark:bg-black border-t border-[#eee] dark:border-[#222] pt-[10px]"
            style={[
                { paddingBottom: insets.bottom },
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

                const iconColor = isFocused ? currentActiveColor : (isDark ? '#6b7280' : '#999');
                const icon = tab.family === 'mci'
                    ? <MaterialCommunityIcons name={tab.activeIcon as any} size={24} color={iconColor} />
                    : <Ionicons
                        name={(isFocused ? tab.activeIcon : tab.inactiveIcon) as any}
                        size={24}
                        color={iconColor}
                    />;

                return (
                    <TouchableOpacity
                        key={tab.name}
                        onPress={onPress}
                        activeOpacity={0.7}
                        className="flex-1 items-center justify-center pb-2 gap-[3px] min-h-[52px]"
                    >
                        {icon}
                        {isFocused && (
                            <Text style={{ fontSize: 11, color: currentActiveColor, fontWeight: '600' }}>
                                {getTabLabel(tab.name)}
                            </Text>
                        )}
                    </TouchableOpacity>
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
