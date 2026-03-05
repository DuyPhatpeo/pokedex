import { create } from 'zustand';
import { fetchPokemonList, fetchPokemonDetail, fetchPokemonSpecies, fetchAllPokemon, fetchType, fetchEvolutionChain } from '../api/pokeApi';
import { PokemonListItem, PokemonDetail } from '../types/pokemon';

interface PokemonState {
    allPokemon: PokemonListItem[];
    pokemonList: PokemonListItem[];
    pokemonDetails: Record<string, PokemonDetail>;
    searchQuery: string;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    offset: number;
    hasMore: boolean;

    setSearchQuery: (query: string) => void;
    loadPokemonList: (refresh?: boolean) => Promise<void>;
    loadPokemonDetail: (name: string) => Promise<void>;
}

export const usePokemonStore = create<PokemonState>((set, get) => ({
    allPokemon: [],
    pokemonList: [],
    pokemonDetails: {},
    searchQuery: '',
    isLoading: false,
    isLoadingMore: false,
    error: null,
    offset: 0,
    hasMore: true,

    setSearchQuery: async (query: string) => {
        set({ searchQuery: query });
        const { allPokemon } = get();

        if (query.trim().length > 0 && allPokemon.length === 0) {
            set({ isLoading: true });
            try {
                const response = await fetchAllPokemon();
                set({ allPokemon: response.results, isLoading: false });
            } catch (err) {
                set({ isLoading: false });
            }
        }

        const storeAfterFetch = get();
        if (query.trim().length > 0) {
            const filtered = storeAfterFetch.allPokemon.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
            set({ pokemonList: filtered, hasMore: false });
        } else {
            get().loadPokemonList(true);
        }
    },

    loadPokemonList: async (refresh = false) => {
        const { offset, isLoading, isLoadingMore, hasMore, searchQuery } = get();
        // Cannot load more while searching
        if (searchQuery.trim().length > 0) return;
        if (isLoading || isLoadingMore || (!hasMore && !refresh)) return;

        if (refresh) {
            set({ isLoading: true, error: null, offset: 0, hasMore: true });
        } else {
            set({ isLoadingMore: true, error: null });
        }

        try {
            const currentOffset = refresh ? 0 : offset;
            const response = await fetchPokemonList(20, currentOffset);

            set((state) => ({
                pokemonList: refresh ? response.results : [...state.pokemonList, ...response.results],
                offset: currentOffset + 20,
                hasMore: response.next !== null,
                isLoading: false,
                isLoadingMore: false,
            }));
        } catch (error: any) {
            set({
                error: error.message || 'Error fetching pokemon list',
                isLoading: false,
                isLoadingMore: false,
            });
        }
    },

    loadPokemonDetail: async (name: string) => {
        const { pokemonDetails } = get();
        if (pokemonDetails[name]) return;

        try {
            // Đầu tiên phải lấy detail chính thức trước vì tên pokemon có thể là biến thể
            const detail = await fetchPokemonDetail(name);

            // Sau đó fetch species bằng detail.id vì ID Species liên thông với ID Pokemon gốc
            const species = await fetchPokemonSpecies(detail.id).catch(() => null);

            let description = '';
            let genderRate = -1;
            let evolutions: { name: string; level: number | null; imageUrl?: string }[] = [];

            if (species) {
                const entry = species.flavor_text_entries.find((e: any) => e.language.name === 'en');
                if (entry) description = entry.flavor_text.replace(/\n|\f|\r/g, ' ');
                genderRate = species.gender_rate;

                if (species.evolution_chain?.url) {
                    try {
                        const evoData = await fetchEvolutionChain(species.evolution_chain.url);
                        const extractEvolutions = (node: any) => {
                            const name = node.species.name;
                            const level = node.evolution_details?.[0]?.min_level || null;
                            const urlParts = node.species.url.split('/').filter(Boolean);
                            const id = urlParts[urlParts.length - 1];
                            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
                            evolutions.push({ name, level, imageUrl });
                            node.evolves_to.forEach((child: any) => extractEvolutions(child));
                        };
                        extractEvolutions(evoData.chain);
                    } catch (e) { }
                }
            }

            // Fetch weaknesses
            let weaknesses: string[] = [];
            if (detail.types && detail.types.length > 0) {
                try {
                    const typePromises = detail.types.map(t => fetchType(t.type.name));
                    const typesData = await Promise.all(typePromises);
                    const weakSet = new Set<string>();

                    typesData.forEach(td => {
                        td.damage_relations.double_damage_from.forEach((w: any) => weakSet.add(w.name));
                    });

                    // Simple weaknesses without resistance calculations for UI layout
                    weaknesses = Array.from(weakSet);
                } catch (e) { }
            }

            const fullDetail = { ...detail, description, weaknesses, evolutions, genderRate };
            set((state) => ({
                pokemonDetails: { ...state.pokemonDetails, [name]: fullDetail }
            }));
        } catch (error) {
            console.error(`Error fetching detail for ${name}:`, error);
        }
    }
}));
