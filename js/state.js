export const state = {
  isLoading: true,
  favorites: JSON.parse(localStorage.getItem("favorites")) || [],
  fullPokemonList: new Map(),
  filteredPokemonList: new Map(),
  pagination: {
    init: 151,
    offset: 12,
  },
  filters: new Set(),
  team1: JSON.parse(localStorage.getItem("team1")) || [],
};
