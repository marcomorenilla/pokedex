export const typeColors = {
    normal: '--poke-normal',
    fire: '--poke-fire',
    water: '--poke-water',
    grass: '--poke-grass',
    electric: '--poke-electric',
    ice: '--poke-ice',
    fighting: '--poke-fighting',
    poison: '--poke-poison',
    ground: '--poke-ground',
    flying: '--poke-flying',
    psychic: '--poke-psychic',
    bug: '--poke-bug',
    rock: '--poke-rock',
    ghost: '--poke-ghost',
    dragon: '--poke-dragon',
    dark: '--poke-dark',
    steel: '--poke-steel',
    fairy: '--poke-fairy',
    stellar: '--poke-stellar',
    unknown: '--poke-unknown'
};

export const state = {
    isLoading: true,
    pokemonList: [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    requestStatus: '',
    fullPokemonList: new Map(),
    filteredPokemonList: new Map()
}

export const traduccionTipos = {
    normal: "normal",
    fire: "fuego",
    water: "agua",
    grass: "planta",
    electric: "eléctrico",
    ice: "hielo",
    fighting: "lucha",
    poison: "veneno",
    ground: "tierra",
    flying: "volador",
    psychic: "psíquico",
    bug: "bicho",
    rock: "roca",
    ghost: "fantasma",
    dragon: "dragón",
    dark: "siniestro",
    steel: "acero",
    fairy: "hada",
    stellar: "estrella",
    unknown: "desconocido"
};

export const traduccionStats = {
    'hp': 'Salud',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'At-especial',
    'special-defense': 'Def-especial',
    'speed': 'Velocidad'
}

export const pagination = {
    init: 151,
    offset:12
}
