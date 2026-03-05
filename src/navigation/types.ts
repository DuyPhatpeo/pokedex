import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Splash: undefined;
    Home: undefined;
    Detail: { name: string; bgColor: string };
};
