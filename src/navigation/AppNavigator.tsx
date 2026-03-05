import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
                    name="Home"
                    component={HomeScreen}
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
