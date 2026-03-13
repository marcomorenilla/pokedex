import { getAllPokemon, getPokemonByUrl, getPokemonByName, getEvolutionChainByPokemon, getTypes } from "./api.js";
import { renderUi, renderCard, renderTypes } from "./renders.js";
import { state } from "./state.js";
import { addToLocalStorage, removeFromLocalStorage } from "./localStorage.js";

/**--Render Ui Config helper --*/

const data = {
    pokemon: null,
    append: true,
}
const cardActions = {
    onIsFavorite: handleIsFavorite,
    onFavoriteClick: handleFavoriteClick,
    onShowEvolutionChain: handleEvolutionChain
}

/**--Desestructuración de pagination */
const { pagination } = state

/** --- Comienzo de handlers --- */
export async function handleInit() {
    state.isLoading = true
    handleLoading()
    const typesData = await getTypes()
    renderTypes(typesData)
    pagination.offset = 0
    const pokemonData = await getAllPokemon(pagination)
    for (const pokemon of pokemonData) {
        const pokemonFullData = await getPokemonByUrl(pokemon.url)
        data.pokemon = pokemonFullData
        data.append = true
        await renderUi(data, cardActions)
        state.fullPokemonList.set(pokemonFullData.id, pokemonFullData)
    }


    state.isLoading = false
    handleLoading()
}

export function handleLoading() {
    document.querySelector('body').classList.add('overflow-hidden')
    const loadingDialog = document.querySelector('#loading-dialog')
    const dots = document.querySelectorAll('.dots')
    if (state.isLoading) {
        dots.forEach((dot, index) => {
            setTimeout(() => {
                dot.classList.add('animate-dots');
            }, index * 200);
        });
        loadingDialog.showModal()
    } else {
        dots.forEach(dot => dot.classList.remove('animate-dots'))
        loadingDialog.close()
        document.querySelector('body').classList.remove('overflow-hidden')
    }
}

export function handleError() {
    const noContentDialog = document.querySelector('#no-content-dialog')
    const noContentDialogBtn = document.querySelector('.no-content-dialog-btn')
    noContentDialog.showModal()

    noContentDialogBtn.addEventListener('click', () => {
        noContentDialog.close()
    })
}

export async function handleSearch(observer, trigger, searchInput) {
    observer.unobserve(trigger)
    state.isLoading = true
    handleLoading()
    const pokemonSearch = await getPokemonByName(searchInput.value)
    if (pokemonSearch) {
        data.pokemon = await getPokemonByName(searchInput.value)
        data.append = false
        await renderUi(data, cardActions)
    } else {
        handleError()
    }
    searchInput.value = ''
    state.isLoading = false
    handleLoading()
}

export async function handleScroll() {
    if (state.isLoading) return

    state.isLoading = true
    handleLoading()

    pagination.offset += pagination.init
    pagination.init = 151


    const newPokemon = await getAllPokemon(pagination)
    for (const pokemon of newPokemon) {
        data.pokemon = await getPokemonByUrl(pokemon.url)
        data.append = true
        await renderUi(data, cardActions)
        state.fullPokemonList.set(data.pokemon.id, data.pokemon)
    }

    state.isLoading = false
    handleLoading()
}


export async function handleFilter(observer, trigger) {
    const btnType = document.querySelectorAll(`.type-btn`)

    btnType.forEach(btn => {
        btn.addEventListener('click', async () => {
            observer.unobserve(trigger)
            state.isLoading = true
            handleLoading()

            if (btn.id != 'todos') {
                console.log('click 1', btn.id)
                handleFilterTypes(btn)
            } else {
                console.log('click 2', btn.id)
                const pokemonList = [...state.fullPokemonList.values()]
                data.append = false
                for (const pokemon of pokemonList) {
                    data.pokemon = pokemon
                    await renderUi(data, cardActions)
                    data.append = true
                }
                state.isLoading = false
                state.filteredPokemonList.clear()
                handleLoading()
                observer.observe(trigger)
            }

        })

    })


}

export async function handleFilterTypes(btn) {
    let pokemonFiltered
    if (btn.id === 'favs') {
        pokemonFiltered = await getPokemonByFavoriteType()
    } else {
        pokemonFiltered = await getPokemonByType(btn.id)
    }

    if (pokemonFiltered.size > 0) {
        const gridSection = document.querySelector('#grid-card-section')
        gridSection.innerHTML = ''
        pokemonFiltered.forEach(pokemon => {
            renderCard(pokemon, cardActions)
        })
        state.isLoading = false
        handleLoading()
    } else {
        const noContentDialog = document.querySelector('#no-content-dialog')
        const noContentDialogBtn = document.querySelector('.no-content-dialog-btn')
        noContentDialog.showModal()

        noContentDialogBtn.addEventListener('click', () => {
            noContentDialog.close()
        })
        state.isLoading = false
        handleLoading()
    }
}

export async function handleEvolutionChain(pokemon) {
    const evolutionChain = await getEvolutionChainByPokemon(pokemon)


    const evolutionChainData = new Map()

    if (evolutionChain.chain.evolves_to.length > 0) {
        evolutionChainData.set('firstEv', state.fullPokemonList.values().find(poke => poke.name === evolutionChain.chain.species.name))
        evolutionChainData.set('secondEv', evolutionChain.chain.evolves_to.length > 0 ? state.fullPokemonList.values().find(poke => poke.name === evolutionChain.chain.evolves_to[0].species.name) : null)
        evolutionChainData.set('thirdEv', evolutionChain.chain.evolves_to[0].evolves_to.length > 0 ? state.fullPokemonList.values().find(poke => poke.name === evolutionChain.chain.evolves_to[0].evolves_to[0].species.name) : null)
    }

    return evolutionChainData
}


export function handleIsFavorite(pokemon) {
    const isFavorite = state.favorites.includes(pokemon.id)
    return isFavorite
}

export function handleFavoriteClick(pokemon, isFavorite) {
    isFavorite ? removeFromLocalStorage(pokemon) : addToLocalStorage(pokemon)
}





export async function getPokemonByType(type) {


    if (state.fullPokemonList.size > 0 && state.filteredPokemonList.size === 0) {
        for (const pokemon of state.fullPokemonList.values()) {
            if (pokemon.types.map(type => type.type.name).includes(type)) {
                state.filteredPokemonList.set(pokemon.id, pokemon)
            }
        }
    } else if (state.filteredPokemonList.size > 0) {
        for (const pokemon of state.filteredPokemonList.values()) {
            if (!pokemon.types.map(type => type.type.name).includes(type)) {
                state.filteredPokemonList.delete(pokemon.id)
            }
        }
    }
    return state.filteredPokemonList
}

export async function getPokemonByFavoriteType() {

    if (state.fullPokemonList.size > 0 && state.filteredPokemonList.size === 0) {
        for (const pokemon of state.fullPokemonList.values()) {
            if (state.favorites.includes(pokemon.id)) {
                state.filteredPokemonList.set(pokemon.id, pokemon)
            }
        }
    } else if (state.filteredPokemonList.size > 0) {
        for (const pokemon of state.filteredPokemonList.values()) {
            if (!state.favorites.includes(pokemon.id)) {
                state.filteredPokemonList.delete(pokemon.id)
            }
        }
    }
    return state.filteredPokemonList
}



