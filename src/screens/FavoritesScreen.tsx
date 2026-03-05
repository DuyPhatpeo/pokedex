import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export const FavoritesScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.center}>
                <Text style={styles.title}>Yêu Thích</Text>
                <Text style={styles.subtitle}>Danh sách Pokémon yêu thích của bạn.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666' }
});
