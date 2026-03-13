export async function getAllPokemon(pagination) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${pagination.init}&offset=${pagination.offset}`

    try {
        const request = await fetch(url)
        if (request.ok) {
            const response = await request.json()
            return response.results.sort((a, b) => a.id - b.id)
        } else {

            throw (new Error(`Algo ha fallado - ${request.status} -${request.text()}`))
        }

    } catch (error) {
        console.log(error)
    }

}

export async function getPokemonByUrl(url) {

    try {
        const request = await fetch(url)
        if (request.ok) {

            const response = await request.json()
            return response
        } else {

            throw (new Error(`Algo ha fallado - ${request.status} -${request.text()}`))
        }
    } catch (error) {
        console.log(error)
    }

}

export async function getPokemonByName(name) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`

    try {
        const request = await fetch(url)

        if (request.ok) {
            const response = await request.json()
            return response
        } else {
            throw (new Error(`Algo ha fallado - ${request.status} -${request.json()}`))


        }
    } catch (error) {
        console.log(error)

    }
}




export async function getTypes() {
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

export async function getPokemonSpecieByPokemon(pokemon) {

    try {
        const request = await fetch(pokemon.species.url)
        if (request.ok) {
            const response = await request.json()
            return response
        } else {
            throw new Error(`Algo ha fallado - ${request.status} -${request.text()}`)
        }
    } catch (error) {
        console.log(error)
    }
}

export async function getEvolutionChainByPokemon(pokemon) {
    const specie = await getPokemonSpecieByPokemon(pokemon)
    const url = specie.evolution_chain.url

    try {
        const request = await fetch(url)
        if (request.ok) {
            const response = await request.json()
            return response
        } else {
            throw new Error(`Algo ha fallado - ${request.status} -${request.text()}`)
        }
    } catch (error) {
        console.log(error)
    }
}
