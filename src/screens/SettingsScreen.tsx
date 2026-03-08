import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Pressable, Switch, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useSettingsStore, LanguageCode } from '../store/useSettingsStore';
import { LANGUAGES, useTranslation } from '../i18n/translations';

const ThemeSwitch = ({ isDark }: { isDark: boolean }) => {
    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(isDark ? 30 : 4, { damping: 15, stiffness: 150 }) }]
    }));

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(isDark ? '#333' : '#e5e7eb', { duration: 200 }) // dark border or background
    }));

    return (
        <Animated.View className="w-[58px] h-[32px] rounded-full justify-center relative border border-gray-100 dark:border-[#333]" style={trackStyle}>
            <Animated.View className="w-[24px] h-[24px] bg-white rounded-full shadow-sm absolute left-0 flex items-center justify-center" style={thumbStyle}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={14} color={isDark ? "#3b82f6" : "#f59e0b"} />
            </Animated.View>
        </Animated.View>
    );
};

export const SettingsScreen = () => {
    const { favorites, clearFavorites } = useFavoritesStore();
    const { language, setLanguage, unitSystem, setUnitSystem } = useSettingsStore();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const t = useTranslation();
    const insets = useSafeAreaInsets();

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const selectedLanguage = LANGUAGES.find((lang) => lang.code === language) || LANGUAGES[0];

    const handleClearFavorites = () => {
        if (favorites.length === 0) {
            Alert.alert(t.notice, t.emptyList);
            return;
        }

        Alert.alert(
            t.clearTitle,
            t.clearMessage,
            [
                { text: t.cancel, style: 'cancel' },
                {
                    text: t.clearAll,
                    style: 'destructive',
                    onPress: () => {
                        clearFavorites();
                        Alert.alert(t.success, t.successMsg);
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
            {/* ===== LANGUAGE MODAL ===== */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <Pressable className="flex-1 justify-center items-center bg-black/50 px-5" onPress={() => setShowLanguageModal(false)}>
                    <Pressable
                        className="bg-white dark:bg-[#1A1A1A] rounded-[24px] w-full p-5 shadow-lg"
                        onPress={() => { }}
                    >
                        <Text className="text-xl font-black text-[#111] dark:text-white mb-4 text-center">{t.selectLanguage}</Text>
                        <View className="bg-gray-100 dark:bg-[#222] rounded-2xl overflow-hidden">
                            {LANGUAGES.map((lang, index) => {
                                const isSelected = selectedLanguage.code === lang.code;
                                const isLast = index === LANGUAGES.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        className={`flex-row items-center justify-between py-4 px-5 bg-white dark:bg-[#1A1A1A] mb-[1px] ${isLast ? '' : 'border-b border-gray-100 dark:border-[#333]'}`}
                                        onPress={() => {
                                            setLanguage(lang.code as LanguageCode);
                                            setShowLanguageModal(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`text-base ${isSelected ? 'font-bold text-[#e3350d] dark:text-red-400' : 'font-medium text-[#333] dark:text-gray-200'}`}>
                                            {lang.label}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={22} color={colorScheme === 'dark' ? '#f87171' : '#e3350d'} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <View className="px-5 pt-4 pb-4">
                <Text className="text-3xl font-black text-[#111] dark:text-white mb-1">{t.settingsTitle}</Text>
                <Text className="text-base text-gray-500 dark:text-gray-400">{t.settingsSubtitle}</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* PREFERENCES SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-4 mb-2 ml-1">
                    {t.preferences}
                </Text>

                <View className="bg-[#f7f7f7] dark:bg-[#1A1A1A] rounded-2xl p-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-[#333] mb-2"
                        onPress={() => setShowLanguageModal(true)}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="language-outline" size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#555'} />
                            <Text className="text-base text-[#333] dark:text-gray-200 font-semibold ml-3">{t.language}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-sm text-gray-400 font-medium">{selectedLanguage.label}</Text>
                            <Ionicons name="chevron-down" size={16} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2 mt-2"
                        onPress={toggleColorScheme}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name="moon-outline"
                                size={24}
                                color={colorScheme === 'dark' ? '#9ca3af' : '#555'}
                            />
                            <Text className="text-base text-[#333] dark:text-gray-200 font-semibold ml-3">{t.darkMode}</Text>
                        </View>
                        <View className="flex-row items-center" pointerEvents="none">
                            <ThemeSwitch isDark={colorScheme === 'dark'} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2 mt-4"
                        onPress={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name="options-outline"
                                size={24}
                                color={colorScheme === 'dark' ? '#9ca3af' : '#555'}
                            />
                            <Text className="text-base text-[#333] dark:text-gray-200 font-semibold ml-3">{t.unitSystem}</Text>
                        </View>
                        <View className="bg-white dark:bg-[#333] px-3 py-1 rounded-full border border-gray-100 dark:border-[#444]">
                            <Text className="text-sm font-bold text-[#e3350d] dark:text-red-400">
                                {unitSystem === 'metric' ? t.themeLight.split(' ')[0] === 'Light' ? 'Metric' : 'Hệ Mét' : t.themeLight.split(' ')[0] === 'Light' ? 'Imperial' : 'Hệ Anh'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* DATA MANAGEMENT SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    {t.dataManagement}
                </Text>

                <View className="bg-[#f7f7f7] dark:bg-[#1A1A1A] rounded-2xl p-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2"
                        onPress={handleClearFavorites}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="trash-outline" size={24} color={colorScheme === 'dark' ? '#f87171' : '#ef4444'} />
                            <Text className="text-base text-red-500 dark:text-red-400 font-semibold ml-3">{t.clearFavorites}</Text>
                        </View>
                        <Text className="text-xs text-gray-400 font-medium tracking-wide">
                            {favorites.length} {t.items}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* DEVELOPER SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    {t.developerSection}
                </Text>

                <View className="bg-[#f7f7f7] dark:bg-[#1A1A1A] rounded-2xl p-4 mb-6">
                    <View className="flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-[#333] mb-2">
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#555'} />
                            <Text className="text-base text-[#333] dark:text-gray-200 font-semibold ml-3">{t.developerSection}</Text>
                        </View>
                        <Text className="text-sm text-gray-400 font-medium">{t.devName}</Text>
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2"
                        onPress={() => Linking.openURL('https://github.com/DuyPhatpeo')}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="logo-github" size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#555'} />
                            <Text className="text-base text-[#333] dark:text-gray-200 font-semibold ml-3">{t.github}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-sm text-blue-500 font-medium">@DuyPhatpeo</Text>
                            <Ionicons name="open-outline" size={14} color="#3b82f6" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ABOUT SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    {t.aboutSection}
                </Text>

                <View className="bg-[#f7f7f7] dark:bg-[#1A1A1A] rounded-2xl p-4 mb-10">
                    <View className="flex-row items-center justify-between py-2">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#555'} />
                            <Text className="text-base text-[#333] dark:text-gray-200 font-semibold ml-3">{t.version}</Text>
                        </View>
                        <Text className="text-sm text-gray-400 font-medium">1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
