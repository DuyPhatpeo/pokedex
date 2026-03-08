import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    Pokedex: undefined;
    Search: undefined;
    Favorites: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Splash: undefined;
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    Detail: { name: string; bgColor: string };
};
