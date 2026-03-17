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
  focus: "team1",
  team1: JSON.parse(localStorage.getItem("team1")) || [],
  team2: JSON.parse(localStorage.getItem("team2")) || [],
  team3: JSON.parse(localStorage.getItem("team3")) || [],
};
