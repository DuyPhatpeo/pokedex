import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const t = useTranslation();

    const getTabLabel = (name: string) => {
        if (name === 'Pokedex') return t.tabPokedex;
        if (name === 'Favorites') return t.tabFavorites;
        if (name === 'Settings') return t.tabSettings;
        return name;
    }

    return (
        <View style={[tabStyles.wrapper, { paddingBottom: insets.bottom }]}>
            {TAB_ITEMS.map((tab, index) => {
                const isFocused = state.index === index;
                const onPress = () => {
                    if (!isFocused) navigation.navigate(tab.name as any);
                };

                const iconColor = isFocused ? ACTIVE_COLOR : '#999';
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
                        style={tabStyles.tabItem}
                    >
                        {icon}
                        {isFocused && (
                            <Text style={tabStyles.label}>{getTabLabel(tab.name)}</Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const tabStyles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: { elevation: 8 },
        }),
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
        gap: 3,
        minHeight: 52,
    },
    label: {
        fontSize: 11,
        color: ACTIVE_COLOR,
        fontWeight: '600',
    },
});

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
