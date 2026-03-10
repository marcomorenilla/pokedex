import { state, typeColors } from "./shared.js";

document.addEventListener('DOMContentLoaded', async function () {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const showAllBtn = document.querySelector('#show-all-btn')


    renderUi(await getAllPokemon(10))



    searchBtn.addEventListener('click', async () => {

        renderUi(await getPokemonByName(searchInput.value))
        searchInput.value = ''
        showAllBtn.classList.remove('hidden')
        console.log('classList', searchBtn.classList)

    })

    showAllBtn.addEventListener('click', async () => {
        renderUi(await getAllPokemon(10))
        showAllBtn.classList.add('hidden')
    })



})



async function renderUi(callback) {
    const gridSection = document.querySelector('#grid-card-section')

    gridSection.innerHTML = ''
    if (state.isLoading && state.requestStatus == 'success') {
        state.isLoading = false
        generateContent(callback)
    }
    state.isLoading = true
}

async function generateContent(callback) {
    const loadingDialog = document.querySelector('#loading-dialog')
    loadingDialog.showModal()


    state.pokemonList = callback

    if (state.pokemonList && state.pokemonList.length > 0) {

        for (const pokemonRaw of state.pokemonList) {
            const pokemon = await getPokemonByUrl(pokemonRaw.url)
            generateCard(pokemon)
        }
    } else if (state.requestStatus = "success") {
        generateCard(state.pokemonList)
    }
    loadingDialog.close()

}


function generateCard(pokemon) {

    const gridSection = document.querySelector('#grid-card-section')
    const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default

    const types = pokemon.types.map(type => type.type.name)


    const cartTpl = /*html */`
    <article id="card-${pokemon.id}" class="flex w-auto h-auto flex-col rounded-lg overflow-hidden shadow-sm hover:shadow-lg items-center">
        <section class="bg-white size-full flex justify-center py-2 px-2 rounded-b-lg">
            <img src="${sprites.other.dream_world.front_default}" alt="pokemon" class="size-30">
        </section>

        <div class="p-2">
            <section id="number-container" class="flex gap-1">
                <h2 class="font-bold">Número:</h2>
                <h2>#${String(pokemon.id).padStart(3, '0')}</h2>
            </section>
            <section id="name-container" class="flex gap-1">
                <h2 class="font-bold">Nombre:</h2>
                <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            </section>
            <section id="type-container" class="flex font-bold justify-center gap-1">
                ${types.map(type => {
        console.log('tipo', type)
        return `<span class="bg-[var(${typeColors[type]})] text-white p-1 rounded-full">${type}</span>`

    }).join('')}
            </section>
        </div>
    </article>
    `

    gridSection.insertAdjacentHTML('beforeend', cartTpl)
    const showMore = document.querySelector(`#card-${pokemon.id}`)

    showMore.addEventListener('click', () => showDetails(pokemon))

}

function showDetails(pokemon) {
    const stastDialog = document.querySelector('#pokemon-stats')
    const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default
    const types = pokemon.types.map(type => type.type.name)
    const stats = pokemon.stats

    stastDialog.innerHTML = ''
    const detailsTpl =/*html*/`
    <div class="w-screen h-screen text-center">
            <div class="p-5 border-b border-b-(--poke-gray) w-full flex justify-center">
                <img src="${sprites.other.dream_world.front_default}" alt="ejemplo" class="">
            </div>

            <div  class="p-2">
                <h2 class="font-bold md:text-5xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <h2 class="font-semi-bold md:text-4xl">#${String(pokemon.id).padStart(3, '0')}</h2>

                <div id="pokemon-stats-types" class="mt-3 flex justify-center  gap-2 md:text-3xl">
                    ${types.map(type => {
        console.log('tipo', type)
        return `<span class="bg-[var(${typeColors[type]})] text-white p-1 rounded-full">${type}</span>`
    }).join('')}
                </div>

                <div class=" md:grid md:grid-cols-[10rem_1fr] m-auto gap-2 md:gap-5 w-1/2 p-1 md:p-4">
                    ${stats.map(stat => {

        let color = "bg-green-500"

        if (stat.base_stat < 30) color = "bg-red-500"
        else if (stat.base_stat < 50) color = "bg-yellow-500"

        return `
        <h2 class="md:text-xl md:text-right font-medium">${stat.stat.name}</h2>

        <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div class="${color} h-full rounded-full w-[${stat.base_stat}%]">
        </div>
        </div>
        `
    }).join('')}
                </div>

                <div class="flex gap-7 justify-center mt-10">
                    <h2 class="font-bold md:text-5xl">Altura: </h2>
                    <h2 class="md:text-5xl">${pokemon.height}</h2>
                    <h2 class="font-bold md:text-5xl">Peso: </h2>
                    <h2 class="md:text-5xl">${pokemon.height}</h2>
                </div>
    
            </div>   

            <button id="btn-close-stats" class=" p-1 bg-(--poke-yellow) font-bold text-xl rounded text-white hover:bg-yellow-700 mb-5 ">Cerrar</button>
        </div>
    `
    stastDialog.insertAdjacentHTML('beforeend', detailsTpl)
    stastDialog.showModal()

    const closeBtn = document.querySelector('#btn-close-stats')

    closeBtn.addEventListener('click', () => stastDialog.close())

}




async function getAllPokemon(limit) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`
    try {
        const request = await fetch(url)

        if (request.ok) {
            state.requestStatus = 'success'
            const response = await request.json()
            return response.results.sort((a, b) => a.id - b.id)
        } else {
            state.requestStatus = 'error'
            throw (new Error(`Algo ha fallado - ${request.status} -${request.text()}`))
        }

    } catch (Error) {
        console.log(Error)
    }

}

async function getPokemonByUrl(url) {
    try {
        const request = await fetch(url)
        if (request.ok) {
            state.requestStatus = 'success'
            const response = await request.json()
            return response
        } else {
            state.requestStatus = 'error'
            throw (new Error(`Algo ha fallado - ${request.status} -${request.text()}`))
        }
    } catch (Error) {
        console.log(Error)
    }

}

async function getPokemonByName(name) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`
    console.log('url', url)
    try {
        const request = await fetch(url)

        if (request.ok) {
            state.requestStatus = 'success'
            const response = await request.json()
            console.log('request', request.status)
            console.log('response ', response)
            return response

        } else {
            state.requestStatus = 'error'
            throw (new Error(`Algo ha fallado - ${request.status} -${request.json()}`))


        }
    } catch (Error) {
        const noContentDialog = document.querySelector('#no-content-dialog')
        const noContentDialogBtn = document.querySelector('.no-content-dialog-btn')
        noContentDialog.showModal()

        noContentDialogBtn.addEventListener('click', () => {
            noContentDialog.close()
        })
        console.log(Error.message)


    }
}