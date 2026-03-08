import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    Pokedex: undefined;
    Search: undefined;
    Generations: undefined;
    Favorites: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Splash: undefined;
    MainTabs: undefined;
    Detail: { name: string; bgColor: string; isShiny?: boolean };
    TypeResults: { type: string };
};
