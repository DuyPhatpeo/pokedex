import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        backgroundColor: withTiming(isDark ? '#60a5fa' : '#e5e7eb', { duration: 200 })
    }));

    return (
        <Animated.View className="w-[58px] h-[32px] rounded-full justify-center relative border border-gray-100" style={trackStyle}>
            <Animated.View className="w-[24px] h-[24px] bg-white rounded-full shadow-sm absolute left-0 flex items-center justify-center" style={thumbStyle}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={14} color={isDark ? "#60a5fa" : "#f59e0b"} />
            </Animated.View>
        </Animated.View>
    );
};

export const SettingsScreen = () => {
    const { favorites, clearFavorites } = useFavoritesStore();
    const { language, setLanguage } = useSettingsStore();
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const t = useTranslation();

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
        <SafeAreaView className="flex-1 bg-white">
            {/* ===== LANGUAGE MODAL ===== */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <Pressable className="flex-1 justify-center items-center bg-black/50 px-5" onPress={() => setShowLanguageModal(false)}>
                    <Pressable
                        className="bg-white rounded-[24px] w-full p-5 shadow-lg"
                        onPress={() => { }}
                    >
                        <Text className="text-xl font-black text-[#111] mb-4 text-center">{t.selectLanguage}</Text>
                        <View className="bg-gray-100 rounded-2xl overflow-hidden">
                            {LANGUAGES.map((lang, index) => {
                                const isSelected = selectedLanguage.code === lang.code;
                                const isLast = index === LANGUAGES.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        className={`flex-row items-center justify-between py-4 px-5 bg-white mb-[1px] ${isLast ? '' : 'border-b border-gray-100'}`}
                                        onPress={() => {
                                            setLanguage(lang.code as LanguageCode);
                                            setShowLanguageModal(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`text-base ${isSelected ? 'font-bold text-[#e3350d]' : 'font-medium text-[#333]'}`}>
                                            {lang.label}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={22} color="#e3350d" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <View className="px-5 pt-4 pb-4">
                <Text className="text-3xl font-black text-[#111] mb-1">{t.settingsTitle}</Text>
                <Text className="text-base text-gray-500">{t.settingsSubtitle}</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* PREFERENCES SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-4 mb-2 ml-1">
                    {t.preferences}
                </Text>

                <View className="bg-[#f7f7f7] rounded-2xl p-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2 border-b border-gray-100 mb-2"
                        onPress={() => setShowLanguageModal(true)}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="language-outline" size={24} color="#555" />
                            <Text className="text-base text-[#333] font-semibold ml-3">{t.language}</Text>
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
                                color="#555"
                            />
                            <Text className="text-base text-[#333] font-semibold ml-3">{t.darkMode}</Text>
                        </View>
                        <View className="flex-row items-center" pointerEvents="none">
                            <ThemeSwitch isDark={colorScheme === 'dark'} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* DATA MANAGEMENT SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    {t.dataManagement}
                </Text>

                <View className="bg-[#f7f7f7] rounded-2xl p-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2"
                        onPress={handleClearFavorites}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                            <Text className="text-base text-red-500 font-semibold ml-3">{t.clearFavorites}</Text>
                        </View>
                        <Text className="text-xs text-gray-400 font-medium tracking-wide">
                            {favorites.length} {t.items}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ABOUT SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    {t.aboutSection}
                </Text>

                <View className="bg-[#f7f7f7] rounded-2xl p-4 mb-10">
                    <View className="flex-row items-center justify-between py-2">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={24} color="#555" />
                            <Text className="text-base text-[#333] font-semibold ml-3">{t.version}</Text>
                        </View>
                        <Text className="text-sm text-gray-400 font-medium">1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

