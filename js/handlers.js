import {
  getAllPokemon,
  getPokemonByUrl,
  getPokemonByName,
  getEvolutionChainByPokemon,
  getTypes,
} from "./api.js";
import {
  renderUi,
  renderNoContentDialog,
  renderTypes,
  renderDragZone,
} from "./renders.js";
import { state } from "./state.js";
import { addToLocalStorage, removeFromLocalStorage } from "./localStorage.js";
import { typeColors } from "./shared.js";

/**--Render Ui Config helper --*/

const data = {
  pokemon: null,
  append: true,
};
const cardActions = {
  onIsFavorite: handleIsFavorite,
  onFavoriteClick: handleFavoriteClick,
  onShowEvolutionChain: handleEvolutionChain,
};

/**--Desestructuración de pagination */
const { pagination } = state;

/** --- Comienzo de handlers --- */
export async function handleInit() {
  state.isLoading = true;
  handleLoading();
  const typesData = await getTypes();
  renderTypes(typesData);
  pagination.offset = 0;
  const pokemonData = await getAllPokemon(pagination);
  for (const pokemon of pokemonData) {
    const pokemonFullData = await getPokemonByUrl(pokemon.url);
    data.pokemon = pokemonFullData;
    data.append = true;
    await renderUi(data, cardActions);
    state.fullPokemonList.set(pokemonFullData.id, pokemonFullData);
  }

  state.isLoading = false;
  handleLoading();
  handleAside();
}

export function handleLoading() {
  document.querySelector("body").classList.add("overflow-hidden");
  const loadingDialog = document.querySelector("#loading-dialog");
  const dots = document.querySelectorAll(".dots");
  if (state.isLoading) {
    dots.forEach((dot, index) => {
      setTimeout(() => {
        dot.classList.add("animate-dots");
      }, index * 200);
    });
    loadingDialog.showModal();
  } else {
    dots.forEach((dot) => dot.classList.remove("animate-dots"));
    loadingDialog.close();
    document.querySelector("body").classList.remove("overflow-hidden");
  }
}

export function handleError() {
  const noContentDialog = document.querySelector("#no-content-dialog");
  const noContentDialogBtn = document.querySelector(".no-content-dialog-btn");
  noContentDialog.showModal();

  noContentDialogBtn.addEventListener("click", () => {
    noContentDialog.close();
  });
}

export async function handleSearch(observer, trigger, searchInput) {
  observer.unobserve(trigger);
  state.isLoading = true;
  handleLoading();
  const pokemonSearch = await getPokemonByName(searchInput.value);
  if (pokemonSearch) {
    data.pokemon = await getPokemonByName(searchInput.value);
    data.append = false;
    await renderUi(data, cardActions);
  } else {
    handleError();
  }
  searchInput.value = "";
  state.isLoading = false;
  handleLoading();
}

export async function handleScroll() {
  if (state.isLoading) return;

  state.isLoading = true;
  handleLoading();

  pagination.offset += pagination.init;
  pagination.init = 151;

  const newPokemon = await getAllPokemon(pagination);
  for (const pokemon of newPokemon) {
    data.pokemon = await getPokemonByUrl(pokemon.url);
    data.append = true;
    await renderUi(data, cardActions);
    state.fullPokemonList.set(data.pokemon.id, data.pokemon);
  }

  state.isLoading = false;
  handleLoading();
}

export async function handleFilter(observer, trigger) {
  const btnType = document.querySelectorAll(`.type-btn`);

  btnType.forEach((btn) => {
    btn.addEventListener("click", async () => {
      observer.unobserve(trigger);
      state.isLoading = true;
      handleLoading();
      if (btn.id != "todos") {
        handleBtnStyle(btn, true);
        handleFilterTypes(btn);
      } else {
        const pokemonList = [...state.fullPokemonList.values()];
        data.append = false;
        for (const pokemon of pokemonList) {
          data.pokemon = pokemon;
          await renderUi(data, cardActions);
          data.append = true;
        }
        state.isLoading = false;
        state.filteredPokemonList.clear();
        handleBtnStyle(btn, false);
        handleLoading();
        observer.observe(trigger);
      }
    });
  });
}

export async function handleFilterTypes(btn) {
  let pokemonFiltered;
  if (btn.id === "favs") {
    pokemonFiltered = await getPokemonByFavoriteType();
  } else {
    pokemonFiltered = await getPokemonByType(btn.id);
  }

  if (pokemonFiltered.size > 0) {
    data.append = false;
    pokemonFiltered.forEach((pokemon) => {
      data.pokemon = pokemon;
      renderUi(data, cardActions);
      data.append = true;
    });
    state.isLoading = false;
    handleLoading();
  } else {
    state.isLoading = false;
    handleLoading();
    renderNoContentDialog();
  }
}

function handleBtnStyle(btn, isClicked = true) {
  if (isClicked && btn.id != "favs") {
    btn.classList.add("bg-white", `text-(${typeColors[btn.id]})`);
    btn.classList.remove(`bg-[var(${typeColors[btn.id]})]`, `text-white`);
  } else if (btn.id === "favs") {
    btn.classList.add(
      "bg-white",
      "border",
      `border-(${typeColors[btn.id]})`,
      `text-(${typeColors[btn.id]})`,
    );
    btn.classList.remove(`bg-[var(${typeColors[btn.id]})]`, `text-white`);
  } else {
    document.querySelectorAll(".type-btn").forEach((btn) => {
      btn.classList.remove("bg-white", `text-(${typeColors[btn.id]})`);
      btn.classList.add(`bg-[var(${typeColors[btn.id]})]`, `text-white`);
    });
  }
}

export async function handleEvolutionChain(pokemon) {
  const evolutionChain = await getEvolutionChainByPokemon(pokemon);

  const evolutionChainData = new Map();

  if (evolutionChain.chain.evolves_to.length > 0) {
    evolutionChainData.set(
      "firstEv",
      state.fullPokemonList
        .values()
        .find((poke) => poke.name === evolutionChain.chain.species.name),
    );
    evolutionChainData.set(
      "secondEv",
      evolutionChain.chain.evolves_to.length > 0
        ? state.fullPokemonList
            .values()
            .find(
              (poke) =>
                poke.name === evolutionChain.chain.evolves_to[0].species.name,
            )
        : null,
    );
    evolutionChainData.set(
      "thirdEv",
      evolutionChain.chain.evolves_to[0].evolves_to.length > 0
        ? state.fullPokemonList
            .values()
            .find(
              (poke) =>
                poke.name ===
                evolutionChain.chain.evolves_to[0].evolves_to[0].species.name,
            )
        : null,
    );
  }

  return evolutionChainData;
}

export function handleIsFavorite(pokemon) {
  const isFavorite = state.favorites.includes(pokemon.id);
  return isFavorite;
}

export function handleFavoriteClick(pokemon, isFavorite) {
  isFavorite ? removeFromLocalStorage(pokemon) : addToLocalStorage(pokemon);
}

export async function getPokemonByType(type) {
  if (state.fullPokemonList.size > 0 && state.filteredPokemonList.size === 0) {
    for (const pokemon of state.fullPokemonList.values()) {
      if (pokemon.types.map((type) => type.type.name).includes(type)) {
        state.filteredPokemonList.set(pokemon.id, pokemon);
      }
    }
  } else if (state.filteredPokemonList.size > 0) {
    for (const pokemon of state.filteredPokemonList.values()) {
      if (!pokemon.types.map((type) => type.type.name).includes(type)) {
        state.filteredPokemonList.delete(pokemon.id);
      }
    }
  }
  return state.filteredPokemonList;
}

export async function getPokemonByFavoriteType() {
  if (state.fullPokemonList.size > 0 && state.filteredPokemonList.size === 0) {
    for (const pokemon of state.fullPokemonList.values()) {
      if (state.favorites.includes(pokemon.id)) {
        state.filteredPokemonList.set(pokemon.id, pokemon);
      }
    }
  } else if (state.filteredPokemonList.size > 0) {
    for (const pokemon of state.filteredPokemonList.values()) {
      if (!state.favorites.includes(pokemon.id)) {
        state.filteredPokemonList.delete(pokemon.id);
      }
    }
  }
  return state.filteredPokemonList;
}

function handleAside() {
  const openBtn = document.getElementById("open-team-btn");

  const closeBtn = document.getElementById("close-team-btn");

  openBtn.addEventListener("click", () => {
    document.getElementById("team-section").classList.remove("hidden");
    openBtn.classList.add("hidden");
    renderDragZone(state.team1, handleDrag);
  });
  closeBtn.addEventListener("click", () => {
    document.getElementById("team-section").classList.add("hidden");
    openBtn.classList.remove("hidden");
  });
}

function handleDrag() {
  const dragZones = document.querySelectorAll(".team-card");

  const draggable = document.querySelectorAll(".draggable");

  handleFocus(".team-menu");

  draggable.forEach((pokemon) => {
    pokemon.addEventListener("dragstart", (e) => {
      const pokeData = {
        id: pokemon.dataset.id,
        name: pokemon.dataset.name,
        sprite: pokemon.dataset.sprite,
      };

      e.dataTransfer.setData("application/json", JSON.stringify(pokeData));
    });
  });

  dragZones.forEach((dragZone) => {
    console.log(dragZone);
    dragZone.addEventListener("dragover", (e) => {
      console.log("dragover");
      e.preventDefault();
    });

    dragZone.addEventListener("drop", (e) => {
      e.preventDefault();
      const jsonData = e.dataTransfer.getData("application/json");
      const data = JSON.parse(jsonData);
      console.log("data drageada", data);
      state.team1.push(data);
      renderDragZone(state.team1, handleDrag);
      console.log("estado equipo", state.team1);
      localStorage.setItem("team1", JSON.stringify(state.team1));
    });
  });
}

function handleFocus(elClass) {
  const allElements = document.querySelectorAll(elClass);

  allElements.forEach((element) => {
    element.classList.remove("bg-white");
    element.addEventListener("click", () => {
      const activeDivs = document.querySelectorAll(elClass);
      activeDivs.forEach((div) => {
        div.classList.remove("bg-white", "[&_h3]:text-(--poke-yellow)");
      });
      element.classList.add("bg-white", "[&_h3]:text-(--poke-yellow)");
    });
  });
}
