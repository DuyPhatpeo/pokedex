import axios from 'axios';
import { PokemonListResponse, PokemonDetail, PokemonSpecies } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const pokeApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export const fetchPokemonList = async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
    const response = await pokeApi.get<PokemonListResponse>(`/pokemon`, {
        params: { limit, offset },
    });
    return response.data;
};

export const fetchPokemonDetail = async (nameOrId: string | number): Promise<PokemonDetail> => {
    const response = await pokeApi.get<PokemonDetail>(`/pokemon/${nameOrId}`);
    return response.data;
};

export const fetchPokemonSpecies = async (nameOrId: string | number): Promise<PokemonSpecies> => {
    const response = await pokeApi.get<PokemonSpecies>(`/pokemon-species/${nameOrId}`);
    return response.data;
};

export const fetchAllPokemon = async (): Promise<PokemonListResponse> => {
    // Lấy danh sách lên tới 10,000 pokemon để dùng cho tìm kiếm local
    const response = await pokeApi.get<PokemonListResponse>(`/pokemon`, {
        params: { limit: 10000, offset: 0 },
    });
    return response.data;
};

export const fetchType = async (nameOrId: string | number): Promise<any> => {
    const response = await pokeApi.get(`/type/${nameOrId}`);
    return response.data;
};

export const fetchEvolutionChain = async (url: string): Promise<any> => {
    const response = await axios.get(url);
    return response.data;
};
