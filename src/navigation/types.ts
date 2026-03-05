import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Home: undefined;
    Detail: { name: string; bgColor: string };
};
