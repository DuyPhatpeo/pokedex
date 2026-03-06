import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../store/useFavoritesStore';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
];

export const SettingsScreen = () => {
    const { favorites, clearFavorites } = useFavoritesStore();
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const handleClearFavorites = () => {
        if (favorites.length === 0) {
            Alert.alert('Notice', 'Your favorites list is already empty.');
            return;
        }

        Alert.alert(
            'Clear Favorites',
            'Are you sure you want to remove all Pokémon from your favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                        clearFavorites();
                        Alert.alert('Success', 'All favorites have been removed.');
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
                        <Text className="text-xl font-black text-[#111] mb-4 text-center">Select Language</Text>
                        <View className="bg-gray-100 rounded-2xl overflow-hidden">
                            {LANGUAGES.map((lang, index) => {
                                const isSelected = selectedLanguage.code === lang.code;
                                const isLast = index === LANGUAGES.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        className={`flex-row items-center justify-between py-4 px-5 bg-white mb-[1px] ${isLast ? '' : 'border-b border-gray-100'}`}
                                        onPress={() => {
                                            setSelectedLanguage(lang);
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
                <Text className="text-3xl font-black text-[#111] mb-1">Settings</Text>
                <Text className="text-base text-gray-500">Preferences and App Info.</Text>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* PREFERENCES SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-4 mb-2 ml-1">
                    Preferences
                </Text>

                <View className="bg-[#f7f7f7] rounded-2xl p-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2 border-b border-gray-100 mb-2"
                        onPress={() => setShowLanguageModal(true)}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="language-outline" size={24} color="#555" />
                            <Text className="text-base text-[#333] font-semibold ml-3">Language</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Text className="text-sm text-gray-400 font-medium">{selectedLanguage.label}</Text>
                            <Ionicons name="chevron-down" size={16} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between py-2 mt-2">
                        <View className="flex-row items-center">
                            <Ionicons name="color-palette-outline" size={24} color="#555" />
                            <Text className="text-base text-[#333] font-semibold ml-3">App Theme</Text>
                        </View>
                        <Text className="text-sm text-gray-400 font-medium">Light (Default)</Text>
                    </View>
                </View>

                {/* DATA MANAGEMENT SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    Data Management
                </Text>

                <View className="bg-[#f7f7f7] rounded-2xl p-4 mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between py-2"
                        onPress={handleClearFavorites}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                            <Text className="text-base text-red-500 font-semibold ml-3">Clear All Favorites</Text>
                        </View>
                        <Text className="text-xs text-gray-400 font-medium tracking-wide">
                            {favorites.length} items
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ABOUT SECTION */}
                <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 mb-2 ml-1">
                    About
                </Text>

                <View className="bg-[#f7f7f7] rounded-2xl p-4 mb-10">
                    <View className="flex-row items-center justify-between py-2">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={24} color="#555" />
                            <Text className="text-base text-[#333] font-semibold ml-3">Version</Text>
                        </View>
                        <Text className="text-sm text-gray-400 font-medium">1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
