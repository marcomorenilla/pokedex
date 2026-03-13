import { typeColors, traduccionTipos, traduccionStats } from "./shared.js";



/** -- Generadores de contenido --- */
export async function renderUi(data, actions) {

    const gridSection = document.querySelector('#grid-card-section')
    if (!data.append) {
        gridSection.innerHTML = ''
    }

    renderDataList(data.pokemon)
    renderCard(data.pokemon, actions)

}

export function renderTypes(types) {
    const typesSection = document.querySelector('#types-section')

    types.forEach(type => {

        const typeTpl = /*html*/`
        <button id="${type.name}" class="type-btn font-bold bg-[var(${typeColors[type.name]})] animate-opacidad text-white p-1 hover:bg-white hover:border-3 hover:shadow-lg hover:border-[var(${typeColors[type.name]})] hover:text-[var(${typeColors[type.name]})] rounded-full">${traduccionTipos[type.name]}</button>
        `
        typesSection.insertAdjacentHTML('beforeend', typeTpl)

    });
    typesSection.insertAdjacentHTML('beforeend', /*html*/`
        <button id="favs" class="type-btn font-bold bg-(--poke-white) animate-opacidad  p-1 hover:bg-(--poke-red) hover:text-white  border-3 hover:shadow-lg border-(--poke-red) text-(--poke-red) rounded-full">Favoritos</button>
        <button id="todos" class="type-btn font-bold bg-(--poke-white) animate-opacidad p-1 hover:bg-(--poke-dark-gray) hover:text-white  border-3 hover:shadow-lg border-(--poke-gray) text-(--poke-gray) rounded-full">Mostrar todos</button>`)

}



export function renderDataList(pokemon) {
    const dataList = document.querySelector('#pokemon-list')
    const optionTpl = `<option value=${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}></option>`
    dataList.insertAdjacentHTML('beforeend', optionTpl)
}


export function renderCard(pokemon, actions) {

    const { onIsFavorite, onFavoriteClick, onShowEvolutionChain } = actions

    const onShowDetails = {
        pokemon,
        onShowEvolutionChain
    }

    const gridSection = document.querySelector('#grid-card-section')
    const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default

    const types = pokemon.types.map(type => type.type.name)

    const isFavorite = onIsFavorite(pokemon)

    const cartTpl = /*html */`
    <article  class="rounded-lg animate-opacidad bg-linear-to-br from-(--poke-ice)/30 to-(--poke-white)  shadow-sm hover:shadow-lg hover:shadow-yellow-500 cursor-pointer">
        <div id="card-${pokemon.id}"class="flex relative w-auto h-auto flex-col  items-center">
            <section class="bg-white size-full flex justify-center py-2 px-2 rounded-b-lg">
                <img src="${sprites.other.dream_world.front_default}" alt="pokemon" class="size-30 z-1">
            </section>

            <div class="p-2">

                <section id="name-container" class="flex justify-center gap-1">
                    <h2 class="font-bold text-xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                </section>
                <section id="type-container" class="flex font-bold justify-center gap-1">
                                    ${types.map(type => {
        return `<span class="bg-[var(${typeColors[type]})] text-white p-1 rounded-full">${traduccionTipos[type]}</span>`

    }).join('')}
                </section>

            </div>
        </div>
        <div class="flex justify-between bg-linear-to-r from-(--poke-yellow) to-(--poke-white) p-1">
            <section id="number-container" class="px-3">
                <h2 class="font-bold text-lg">#${String(pokemon.id).padStart(3, '0')}</h2>
            </section>
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
                    fill="${isFavorite ? '#cc0000' : 'none'}"
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

        onFavoriteClick(pokemon, isFavorite)

        if (!isFavorite) {

            pathCorazon.setAttribute('fill', '#cc0000');
            corazonSvg.style.transform = "scale(1.2)";
            setTimeout(() => corazonSvg.style.transform = "scale(1)", 100);

        } else {
            pathCorazon.setAttribute('fill', 'none');
        }
    });


    showMore.addEventListener('click', async () => await renderDetails(onShowDetails))

}



export async function renderDetails(onShowDetails) {

    const { pokemon, onShowEvolutionChain } = onShowDetails
    const stastDialog = document.querySelector('#pokemon-stats')
    const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default
    const types = pokemon.types.map(type => type.type.name)
    const stats = pokemon.stats

    stastDialog.innerHTML = ''
    const detailsTpl =/*html*/`
    <div class="m-auto animate-visible bg-white rounded-2xl w-5/6 overflow-y-auto max-h-[90vh] text-center shadow-2xl">
            <div class="p-5 border-b border-b-(--poke-gray) flex justify-center items-center">
                <img src="${sprites.other.dream_world.front_default}" alt="ejemplo" class="p-2 size-40">
            </div>

            <div  class="p-2 h-[50%]">
                <h2 class="font-bold md:text-4xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <h2 class="font-semi-bold md:text-3xl">#${String(pokemon.id).padStart(3, '0')}</h2>

                <div id="pokemon-stats-types" class="mt-3 flex justify-center items-center font-bold gap-1 ">
                    ${types.map(type => {
        return `<span class="bg-[var(${typeColors[type]})] text-white p-1 rounded-full">${traduccionTipos[type]}</span>`
    }).join('')}
                </div>

                <div class="mt-2 flex flex-col gap-2 items-center">
                    ${stats.map(stat => {

        let color = "bg-green-500"

        if (stat.base_stat < 30) color = "bg-red-500"
        else if (stat.base_stat < 50) color = "bg-yellow-500"

        return `<div class="leading-none grid grid-cols-2 gap-1 w-48 md:w-96 items-center content-start">
                    
                    <h2 class="md:text-lg text-start font-medium">${traduccionStats[stat.stat.name]}</h2>

                        <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="${color} animate-stat h-full rounded-full w-[${stat.base_stat}%]">
                        </div>
                    </div>
                </div>`
    }).join('')}
                </div>

                <div class="flex md:max-w-1/2 md:m-auto justify-between px-4 mt-3">
                    <h2 class="font-bold md:text-xl">Altura: </h2>
                    <h2 class="md:text-xl">${pokemon.height / 10}m</h2>
                    <h2 class="font-bold md:text-xl">Peso: </h2>
                    <h2 class="md:text-xl">${pokemon.weight / 10}kg</h2>
                </div>
    
            </div>  

            <button id="btn-close-stats" class=" p-1 bg-(--poke-yellow) font-bold text-xl rounded text-white hover:bg-yellow-700 mb-5 ">Cerrar</button>

            <div id="evolution-chain" class="p-5 border-t border-t-(--poke-gray) flex-col justify-center w-full items-center gap-10"> 
            <h2 class="font-bold md:text-xl p-2" >Cadena de evolución:</h2>
            <div id="evolution-chain-container" class="flex   justify-between lg:w-3/5 m-auto [&_svg]:last:hidden items-center"></div>
            </div>
        </div>
    `


    stastDialog.insertAdjacentHTML('beforeend', detailsTpl)
    stastDialog.classList.toggle('hidden')
    document.querySelector('body').classList.add('overflow-hidden')

    const divEvolutionChain = document.querySelector('#evolution-chain-container')

    const evolutionChainData = await onShowEvolutionChain(pokemon)

    for (const [key, pokemonEv] of evolutionChainData) {
        if (pokemonEv) {
            divEvolutionChain.insertAdjacentHTML('beforeend', renderEvolutionChain(pokemonEv))
            divEvolutionChain.insertAdjacentHTML('beforeend', /*html*/`<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5L16 12L8 19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`)


        }
    }

    if (evolutionChainData.size === 0) {
        divEvolutionChain.insertAdjacentHTML('beforeend', /*html*/`<h2 class="font-bold md:text-lg">Este Pokémon no tiene evolución</h2>`)
    }



    stastDialog.addEventListener('click', (e) => {

        if (!stastDialog.classList.contains('hidden')) {
            stastDialog.classList.toggle('hidden')
            document.querySelector('body').classList.remove('overflow-hidden')
        }
    })


    const closeBtn = document.querySelector('#btn-close-stats')

    closeBtn.addEventListener('click', () => {
        stastDialog.classList.toggle('hidden')
        document.querySelector('body').classList.remove('overflow-hidden')

    })

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !stastDialog.classList.contains('hidden')) stastDialog.classList.toggle('hidden')
    })

}


export function renderEvolutionChain(pokemon) {
    const evolutionChainTpl = /*html*/` 
    <div class="flex justify-between gap-5  items-center">
        <img src="${pokemon.sprites.other.dream_world.front_default}" alt="ejemplo" class="size-15 md:size-30">
    </div>`

    return evolutionChainTpl
}