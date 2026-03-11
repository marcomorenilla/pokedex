import { state, typeColors, traduccionTipos, pagination } from "./shared.js";

document.addEventListener('DOMContentLoaded', async function () {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const showAllBtn = document.querySelector('#show-all-btn')
    const trigger = document.querySelector("#scroll-trigger");





    const observer = new IntersectionObserver((entries) => {

        const entry = entries[0];

        if (entry.isIntersecting) {
            console.log('observando scroll')
            handleScroll()
        }

    }, {
        root: null,
        threshold: 0.1
    });

    observer.observe(trigger);

    await generateTypes()
    await handleFilter(observer, trigger)



    searchBtn.addEventListener('click', async () => {
        observer.unobserve(trigger)
        console.log('buscando')
        state.isLoading = true
        handleLoading()
        await renderUi(await getPokemonByName(searchInput.value), false)
        searchInput.value = ''
        showAllBtn.classList.remove('hidden')
        console.log('classList', searchBtn.classList)
        state.isLoading = false
        handleLoading()

    })

    showAllBtn.addEventListener('click', async () => {
        observer.observe(trigger)
        console.log('mostrando todos')
        pagination.offset = 0
        state.isLoading = true
        handleLoading()
        await renderUi(await getAllPokemon(pagination), false)
        state.isLoading = false
        handleLoading()
        showAllBtn.classList.add('hidden')
    })





})
async function init() {
    state.isLoading = true
    handleLoading()

    pagination.offset = 0

    await renderUi(await getAllPokemon(pagination), false)


    state.isLoading = false
    handleLoading()
}


async function handleScroll() {
    if (state.isLoading) return

    state.isLoading = true
    handleLoading()

    pagination.offset += pagination.init

    const newPokemon = await getAllPokemon(pagination)

    await renderUi(newPokemon, true)

    state.isLoading = false
    handleLoading()
}

async function handleFilter(observer, trigger) {
    const btnType = document.querySelectorAll(`.type-btn`)
    console.log('btnType?? ', btnType)
    btnType.forEach(btn => {
        btn.addEventListener('click', async () => {
            observer.unobserve(trigger)
            pagination.offset = 0
            state.isLoading = true
            handleLoading()
            console.log('type to seach', btn.id)

            if (btn.id != 'todos') {
                handleFilterTypes(btn)
            } else {
                await renderUi(await getAllPokemon(pagination), false)
                state.isLoading = false
                handleLoading()
                observer.observe(trigger)
            }



        })

    })

}

async function handleFilterTypes(btn) {
    const pokemonFiltered = await getPokemonByType(btn.id)
    console.log('filtered', pokemonFiltered)

    if (pokemonFiltered.length > 0) {

        const gridSection = document.querySelector('#grid-card-section')
        gridSection.innerHTML = ''
        pokemonFiltered.forEach(pokemon => {
            generateCard(pokemon)
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





async function renderUi(callback, append) {
    console.log('state-is-loading', state.isLoading)

    const gridSection = document.querySelector('#grid-card-section')
    console.log('append', append)
    if (!append) {
        console.log('limpiando')
        gridSection.innerHTML = ''
    }

    if (state.requestStatus == 'success') {
        await generateContent(callback)
    }

}

async function generateTypes() {
    const types = await getTypes()
    console.log('tipos', types)
    const typesSection = document.querySelector('#types-section')

    types.forEach(type => {

        const typeTpl = /*html*/`
        <button id="${type.name}" class="type-btn font-bold bg-[var(${typeColors[type.name]})] animate-opacidad text-white p-1 hover:bg-white hover:border-3 hover:shadow-lg hover:border-[var(${typeColors[type.name]})] hover:text-[var(${typeColors[type.name]})] rounded-full">${traduccionTipos[type.name]}</button>
        `
        typesSection.insertAdjacentHTML('beforeend', typeTpl)

    });
    typesSection.insertAdjacentHTML('beforeend', /*html*/`
        <button id="todos" class="type-btn font-bold bg-(--poke-white) animate-opacidad t p-1 hover:bg-(--poke-dark-gray) hover:text-white  border-3 hover:shadow-lg border-(--poke-gray) text-(--poke-gray) rounded-full">Mostrar todos</button>`)
        

    await init()


}



async function generateContent(callback) {

    state.pokemonList = callback

    if (state.pokemonList && state.pokemonList.length > 0) {

        for (const pokemonRaw of state.pokemonList) {
            const pokemon = await getPokemonByUrl(pokemonRaw.url)
            generateDataList(pokemon)
            generateCard(pokemon)
        }
    } else if (state.requestStatus == 'success') {
        generateCard(state.pokemonList)
    }


}

function generateDataList(pokemon) {
    const dataList = document.querySelector('#pokemon-list')
    const optionTpl = `<option value=${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}></option>`
    dataList.insertAdjacentHTML('beforeend', optionTpl)
}


function generateCard(pokemon) {

    const gridSection = document.querySelector('#grid-card-section')
    const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default

    const types = pokemon.types.map(type => type.type.name)


    const cartTpl = /*html */`
    <article  class="rounded-lg animate-opacidad overflow-hidden shadow-sm hover:shadow-lg">
        <div id="card-${pokemon.id}"class="flex w-auto h-auto flex-col  items-center">
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
        return `<span class="bg-[var(${typeColors[type]})] text-white p-1 rounded-full">${traduccionTipos[type]}</span>`

    }).join('')}
                </section>

            </div>
        </div>
        <div class="flex justify-end bg-(--poke-yellow) p-1">
            <svg 
                id="heart-${pokemon.id}" 
                width="20px" 
                height="20px" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style="cursor: pointer;"
                >
                <path id="path-corazon-${pokemon.id}"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill="${state.favorites.includes(pokemon.id) ? '#cc0000' : 'none'}" 
                    stroke="#CC0000" 
                    stroke-width="2"
                />
            </svg>
        </div>
    </article>
    `
    gridSection.insertAdjacentHTML('beforeend', cartTpl)
    const showMore = document.querySelector(`#card-${pokemon.id}`)

    const corazonSvg = document.getElementById(`heart-${pokemon.id}`);
    const pathCorazon = document.getElementById(`path-corazon-${pokemon.id}`);



    corazonSvg.addEventListener('click', () => {

        let esFavorito = state.favorites.includes(pokemon.id);

        if (!esFavorito) {
            addToLocalStorage(pokemon)
            pathCorazon.setAttribute('fill', '#cc0000');
            pathCorazon.setAttribute('stroke', '#cc0000');
            corazonSvg.style.transform = "scale(1.2)";
            setTimeout(() => corazonSvg.style.transform = "scale(1)", 100);

        } else {
            removeFromLocalStorage(pokemon)
            pathCorazon.setAttribute('fill', 'none');
            pathCorazon.setAttribute('stroke', '#cc0000');
        }
    });

    showMore.addEventListener('click', () => showDetails(pokemon))

}

function addToLocalStorage(pokemon) {
    state.favorites.push(pokemon.id)
    localStorage.setItem('favorites', JSON.stringify(state.favorites))
}

function removeFromLocalStorage(pokemon) {
    console.log('pokemon id', pokemon.id)
    state.favorites = state.favorites.filter(id => pokemon.id != id)
    console.log('Estado modificado', state.favorites)
    localStorage.setItem('favorites', JSON.stringify(state.favorites))
}

function showDetails(pokemon) {
    const stastDialog = document.querySelector('#pokemon-stats')
    const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default
    const types = pokemon.types.map(type => type.type.name)
    const stats = pokemon.stats

    stastDialog.innerHTML = ''
    const detailsTpl =/*html*/`
    <div class="text-center animate-visible bg-white rounded-2xl w-full shadow-2xl w-auto">
            <div class="p-5 border-b border-b-(--poke-gray) flex justify-center items-center">
                <img src="${sprites.other.dream_world.front_default}" alt="ejemplo" class="p-2 size-40">
            </div>

            <div  class="p-2 h-[50%]">
                <h2 class="font-bold md:text-4xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <h2 class="font-semi-bold md:text-3xl">#${String(pokemon.id).padStart(3, '0')}</h2>

                <div id="pokemon-stats-types" class="mt-3 flex justify-center items-center gap-1 md:text-2xl">
                    ${types.map(type => {
        console.log('tipo', type)
        return `<span class="bg-[var(${typeColors[type]})] text-white p-1 rounded-full">${traduccionTipos[type]}</span>`
    }).join('')}
                </div>

                <div class="mt-2 flex flex-col gap-2 items-center">
                    ${stats.map(stat => {

        let color = "bg-green-500"

        if (stat.base_stat < 30) color = "bg-red-500"
        else if (stat.base_stat < 50) color = "bg-yellow-500"

        return `<div class="grid grid-cols-2 gap-2 w-48 md:w-96 items-center content-start">
                    
                    <h2 class="md:text-xl text-start font-medium">${stat.stat.name}</h2>

                        <div class="w-full  border bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div class="${color} animate-stat h-full rounded-full w-[${stat.base_stat}%]">
                        </div>
                    </div>
                </div>`
    }).join('')}
                </div>

                <div class="flex gap-7 justify-center mt-10">
                    <h2 class="font-bold md:text-3xl">Altura: </h2>
                    <h2 class="md:text-3xl">${pokemon.height / 10}m</h2>
                    <h2 class="font-bold md:text-3xl">Peso: </h2>
                    <h2 class="md:text-3xl">${pokemon.weight / 10}kg</h2>
                </div>
    
            </div>   

            <button id="btn-close-stats" class=" p-1 bg-(--poke-yellow) font-bold text-xl rounded text-white hover:bg-yellow-700 mb-20 ">Cerrar</button>
        </div>
    `
    stastDialog.insertAdjacentHTML('beforeend', detailsTpl)
    stastDialog.classList.toggle('hidden')

    stastDialog.addEventListener('click', (e) => {
        if (!stastDialog.classList.contains('hidden')) {
            stastDialog.classList.toggle('hidden')
        }
    })


    const closeBtn = document.querySelector('#btn-close-stats')

    closeBtn.addEventListener('click', () => stastDialog.classList.toggle('hidden'))

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !stastDialog.classList.contains('hidden')) stastDialog.classList.toggle('hidden')
    })

}




async function getAllPokemon(pagination) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${pagination.init}&offset=${pagination.offset}`
    console.log('url', url)


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
    const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`
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

async function getPokemonByType(type) {


    let pokeList = []

    for (const pokemon of state.pokemonList) {
        pokeList.push(await getPokemonByUrl(pokemon.url))

    }
    console.log('pokemon', pokeList)

    return pokeList.filter(pokemon => pokemon.types.map(type => type.type.name).includes(type))
}



async function getTypes() {
    const url = `https://pokeapi.co/api/v2/type`

    try {
        const request = await fetch(url)


        if (request.ok) {
            const response = await request.json()
            return response.results

        } else {
            throw new Error(`Algo ha fallado - ${request.status} -${request.text()}`)
        }
    } catch (error) {
        console.log(error)
    }
}


function handleLoading() {
    const loadingDialog = document.querySelector('#loading-dialog')
    if (state.isLoading) {
        loadingDialog.showModal()
    } else {
        loadingDialog.close()
    }
}
