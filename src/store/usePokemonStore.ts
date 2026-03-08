import { create } from 'zustand';
import { fetchPokemonList, fetchPokemonDetail, fetchPokemonSpecies, fetchAllPokemon, fetchType, fetchEvolutionChain } from '../api/pokeApi';
import { PokemonListItem, PokemonDetail } from '../types/pokemon';

interface PokemonState {
    allPokemon: PokemonListItem[];
    homePokemonList: PokemonListItem[]; // For paginated home screen
    searchResults: PokemonListItem[];   // For filtered search results
    pokemonDetails: Record<string, PokemonDetail>;
    typeCache: Record<string, PokemonListItem[]>;
    searchQuery: string;
    activeTypeFilter: string[];
    sortOption: string;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    offset: number;
    hasMore: boolean;

    setSearchQuery: (query: string) => void;
    setTypeFilter: (type: string | null) => void;
    toggleTypeFilter: (type: string) => void;
    clearTypeFilter: () => void;
    setSortOption: (sort: string) => void;
    applyFiltersAndSort: () => Promise<void>;
    loadPokemonList: (refresh?: boolean) => Promise<void>;
    loadAllPokemon: () => Promise<void>;
    loadPokemonDetail: (name: string) => Promise<void>;
    preloadGenerationDetails: (names: string[]) => Promise<void>;
}

export const usePokemonStore = create<PokemonState>((set, get) => ({
    allPokemon: [],
    homePokemonList: [],
    searchResults: [],
    pokemonDetails: {},
    typeCache: {},
    searchQuery: '',
    activeTypeFilter: [],
    sortOption: 'id-asc',
    isLoading: false,
    isLoadingMore: false,
    error: null,
    offset: 0,
    hasMore: true,

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        get().applyFiltersAndSort();
    },

    setTypeFilter: (type: string | null) => {
        set({ activeTypeFilter: type ? [type] : [] });
        get().applyFiltersAndSort();
    },

    toggleTypeFilter: (type: string) => {
        const current = get().activeTypeFilter;
        const next = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        set({ activeTypeFilter: next });
        get().applyFiltersAndSort();
    },

    clearTypeFilter: () => {
        set({ activeTypeFilter: [] });
        get().applyFiltersAndSort();
    },

    setSortOption: (sort: string) => {
        set({ sortOption: sort });
        get().applyFiltersAndSort();
    },

    applyFiltersAndSort: async () => {
        const state = get();
        const { searchQuery, activeTypeFilter, sortOption, allPokemon, typeCache } = state;
        const hasTypeFilter = activeTypeFilter.length > 0;
        const hasSearch = searchQuery.trim().length > 0;

        if (!hasSearch && !hasTypeFilter) {
            set({ searchResults: [] });
            return;
        }

        set({ isLoading: true });
        const getPokemonId = (url: string) => {
            const parts = url.split('/').filter(Boolean);
            return parseInt(parts[parts.length - 1], 10);
        };

        try {
            let baseList: PokemonListItem[] = [];

            if (hasTypeFilter) {
                const listsByType = await Promise.all(
                    activeTypeFilter.map(async (type) => {
                        if (typeCache[type]) return typeCache[type];
                        const typeData = await fetchType(type);
                        const list: PokemonListItem[] = typeData.pokemon.map((p: any) => p.pokemon);
                        set((s) => ({ typeCache: { ...s.typeCache, [type]: list } }));
                        return list;
                    })
                );

                if (listsByType.length === 1) {
                    baseList = listsByType[0];
                } else {
                    const nameSets = listsByType.map(l => new Set(l.map(p => p.name)));
                    baseList = listsByType[0].filter(p => nameSets.every(s => s.has(p.name)));
                }
            } else {
                if (allPokemon.length === 0) {
                    const response = await fetchAllPokemon();
                    set({ allPokemon: response.results });
                    baseList = response.results;
                } else {
                    baseList = allPokemon;
                }
            }

            let resultList = baseList;

            if (hasSearch) {
                const q = searchQuery.toLowerCase();
                resultList = resultList.filter(p => p.name.toLowerCase().includes(q));
            }

            resultList = [...resultList].sort((a, b) => {
                if (sortOption === 'id-asc') return getPokemonId(a.url) - getPokemonId(b.url);
                if (sortOption === 'id-desc') return getPokemonId(b.url) - getPokemonId(a.url);
                if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
                if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
                return 0;
            });

            set({ searchResults: resultList, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
        }
    },

    loadPokemonList: async (refresh = false) => {
        const state = get();
        if (state.isLoading || state.isLoadingMore || (!state.hasMore && !refresh)) return;

        if (refresh) {
            set({ isLoading: true, error: null, offset: 0, hasMore: true });
        } else {
            set({ isLoadingMore: true, error: null });
        }

        try {
            const currentOffset = refresh ? 0 : get().offset;
            const response = await fetchPokemonList(20, currentOffset);

            set((s) => ({
                homePokemonList: refresh ? response.results : [...s.homePokemonList, ...response.results],
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

    loadAllPokemon: async () => {
        if (get().allPokemon.length > 0) return;

        set({ isLoading: true });
        try {
            const response = await fetchAllPokemon();
            set({ allPokemon: response.results, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    loadPokemonDetail: async (name: string) => {
        const { pokemonDetails } = get();
        if (pokemonDetails[name]) return;

        try {
            const detail = await fetchPokemonDetail(name);
            const species = await fetchPokemonSpecies(detail.id).catch(() => null);

            let description = '';
            let genderRate = -1;
            let evolutions: { name: string; level: number | null; imageUrl?: string; types?: string[] }[] = [];

            if (species) {
                const entry = species.flavor_text_entries.find((e: any) => e.language.name === 'en');
                if (entry) description = entry.flavor_text.replace(/\n|\f|\r/g, ' ');
                genderRate = species.gender_rate;

                if (species.evolution_chain?.url) {
                    try {
                        const evoData = await fetchEvolutionChain(species.evolution_chain.url);
                        const extractEvolutions = async (node: any) => {
                            const name = node.species.name;
                            const level = node.evolution_details?.[0]?.min_level || null;
                            const urlParts = node.species.url.split('/').filter(Boolean);
                            const id = urlParts[urlParts.length - 1];
                            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

                            let types: string[] = [];
                            try {
                                const evoDetail = await fetchPokemonDetail(id);
                                types = evoDetail.types.map((t: any) => t.type.name);
                            } catch (e) { }

                            evolutions.push({ name, level, imageUrl, types });
                            for (const child of node.evolves_to) {
                                await extractEvolutions(child);
                            }
                        };
                        await extractEvolutions(evoData.chain);
                    } catch (e) { }
                }
            }

            let weaknesses: string[] = [];
            if (detail.types && detail.types.length > 0) {
                try {
                    const typePromises = detail.types.map(t => fetchType(t.type.name));
                    const typesData = await Promise.all(typePromises);
                    const weakSet = new Set<string>();

                    typesData.forEach(td => {
                        td.damage_relations.double_damage_from.forEach((w: any) => weakSet.add(w.name));
                    });

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
    },

    preloadGenerationDetails: async (names: string[]) => {
        const { pokemonDetails } = get();
        const toFetch = names.filter(name => !pokemonDetails[name]);

        if (toFetch.length === 0) return;

        // Fetch in batches of 10 to avoid overwhelming the API/Network
        const batchSize = 10;
        for (let i = 0; i < toFetch.length; i += batchSize) {
            const batch = toFetch.slice(i, i + batchSize);
            await Promise.all(batch.map(name => get().loadPokemonDetail(name)));
        }
    }
}));
