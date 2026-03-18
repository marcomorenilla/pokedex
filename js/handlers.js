import {
  getAllPokemon,
  getPokemonByUrl,
  getPokemonByName,
  getEvolutionChainByPokemon,
  getTypes,
} from "./api.js";
import {
  renderUi,
  renderTypes,
  renderDragZone,
  renderCardV2,
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
  onAddToTeam: handleResponsiveDrag,
  onSelectionMenu: hanldeSelectionMenu,
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
    console.log("btn", btn.id);
    btn.addEventListener("click", async () => {
      observer.unobserve(trigger);
      state.isLoading = true;
      handleLoading();
      if (btn.id != "todos") {
        handleBtnStyle(btn, true);
        handleFilterTypes(btn, observer, trigger);
      } else {
        handleBtnStyle(btn, false);
        handleResetFilters(btn, observer, trigger);
      }
    });
  });
}

async function handleResetFilters(btn, observer, trigger) {
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

export async function handleFilterTypes(btn, observer, trigger) {
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
    handleNoContentDialog(btn, observer, trigger);
  }
}

function handleNoContentDialog(btn, observer, trigger) {
  const noContentDialog = document.querySelector("#no-content-dialog");
  const noContentDialogBtn = document.querySelector(".no-content-dialog-btn");
  noContentDialog.showModal();

  noContentDialogBtn.addEventListener("click", () => {
    noContentDialog.close();
    handleResetFilters(btn, observer, trigger);
  });
}

function handleBtnStyle(btn, isClicked = true) {
  console.log("btn", btn.id);
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
  console.log("handleFavoriteClick", isFavorite);
  isFavorite ? addToLocalStorage(pokemon) : removeFromLocalStorage(pokemon);
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

  const deleteTeamBtn = document.getElementById("delete-team-btn");
  const showTeamDetailsBtn = document.getElementById("show-team-details-btn");

  showTeamDetailsBtn.addEventListener("click", handleTeamDetails);

  deleteTeamBtn.addEventListener("click", handleDeleteTeam);

  const teamSelected = state.focus;

  openBtn.addEventListener("click", () => {
    document.getElementById("team-section").classList.remove("hidden");
    document.querySelector("main").classList.add("w-3/5");
    document
      .querySelector("#grid-card-section")
      .classList.remove("lg:grid-cols-6");
    document
      .querySelector("#grid-card-section")
      .classList.add("lg:grid-cols-3");
    openBtn.classList.add("hidden");
    handleFocus(".team-menu");
    renderDragZone(state[teamSelected], handleDrag);
  });
  closeBtn.addEventListener("click", () => {
    document.getElementById("team-section").classList.add("hidden");
    document
      .querySelector("#grid-card-section")
      .classList.add("lg:grid-cols-6");
    document
      .querySelector("#grid-card-section")
      .classList.remove("lg:grid-cols-3");
    document.querySelector("main").classList.remove("w-3/5");
    openBtn.classList.remove("hidden");
  });
}

function handleResponsiveDrag(pokemon) {
  console.log(pokemon);
  state.focus = "team1";
  handleFocus(".team-menu");
  document.getElementById("team-section").classList.remove("hidden");
  const teamSelected = state.focus;
  renderDragZone(state[teamSelected], () => {});

  const dragSection = document.querySelector("#drag-section");

  if (dragSection._controller) {
    dragSection._controller.abort();
  }

  dragSection._controller = new AbortController();
  const { signal } = dragSection._controller;

  dragSection.addEventListener(
    "click",
    () => {
      const teamToAdd = state.focus;
      const pokemonData = {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites.other.dream_world.front_default,
      };

      console.log("pokemon data: ", pokemonData);
      if (state[teamToAdd].length < 6) {
        state[teamToAdd].push(pokemonData);
        console.log("pokemon added: ", state[teamToAdd], teamToAdd);
        localStorage.setItem(teamToAdd, JSON.stringify(state[teamToAdd]));
        document.getElementById("team-section").classList.add("hidden");
        document.getElementById("open-team-btn").classList.remove("hidden");
        document.querySelector("#responsive-notification").showModal();
        setTimeout(() => {
          document.querySelector("#responsive-notification").close();
        }, 2000);
      } else {
        document.querySelector("#full-team-dialog").showModal();
      }
    },
    { signal },
  );
}

function handleDrag() {
  const dragZones = document.querySelectorAll(".team-card");

  const draggable = document.querySelectorAll(".draggable");

  const teamSelected = state.focus;

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
      console.log("data drageada en", data, e.target);
      if (state[teamSelected].length < 6) {
        state[teamSelected].push(data);
        renderDragZone(state[teamSelected], handleDrag);
        console.log("estado equipo", state[teamSelected]);
        localStorage.setItem(teamSelected, JSON.stringify(state[teamSelected]));
      } else {
        document.querySelector("#full-team-dialog").showModal();
      }
    });
  });
}

function handleFocus(elClass) {
  const allElements = document.querySelectorAll(elClass);

  let teamSelected;

  allElements.forEach((element) => {
    if (element.id == "team1") {
      element.classList.add("bg-white", "[&_h3]:text-(--poke-yellow)");
    } else {
      element.classList.remove("bg-white", "[&_h3]:text-(--poke-yellow)");
    }

    element.addEventListener("click", () => {
      const activeDivs = document.querySelectorAll(elClass);
      activeDivs.forEach((div) => {
        div.classList.remove("bg-white", "[&_h3]:text-(--poke-yellow)");
      });
      element.classList.add("bg-white", "[&_h3]:text-(--poke-yellow)");
      teamSelected = element.id;
      console.log("handle focus", teamSelected);
      state.focus = teamSelected;

      renderDragZone(state[teamSelected], handleDrag);
    });
  });
}

function handleDeleteTeam() {
  const deleteDialog = document.getElementById("delete-team-dialog");
  const form = document.getElementById("delete-team-form");
  const cancelBtn = document.getElementById("cancel-delete-team");
  const teamSelected = state.focus;

  deleteDialog.showModal();

  cancelBtn.addEventListener("click", () => {
    deleteDialog.close();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    state[teamSelected] = [];
    localStorage.removeItem(teamSelected);
    renderDragZone(state[teamSelected], handleDrag);
    deleteDialog.close();
  });
}

function handleTeamDetails() {
  const detailsSection = document.querySelector("#show-team-details");
  const closeDetailsBtn = document.querySelector("#close-team-details");
  const section = "#grid-team-section";
  const documentSection = document.querySelector(section);
  const teamTitle = document.querySelector("#team-details-title");
  console.log("sección equipo", teamTitle);
  const teamSelected = state.focus;
  console.log("equipo seleccionado", teamSelected);

  let translatedTeam = "";

  switch (teamSelected) {
    case "team1":
      translatedTeam = "Equipo 1";
      break;
    case "team2":
      translatedTeam = "Equipo 2";
      break;
    case "team3":
      translatedTeam = "Equipo 3";
      break;
  }
  teamTitle.innerHTML = translatedTeam;
  documentSection.innerHTML = "";

  detailsSection.classList.remove("hidden");
  closeDetailsBtn.addEventListener("click", () => {
    detailsSection.classList.add("hidden");
  });

  const team = state[teamSelected].map((pokemon) => {
    return state.fullPokemonList.get(Number(pokemon.id));
  });

  team.forEach((pokemon) => {
    renderCardV2(pokemon, cardActions, section);
  });
}

function hanldeSelectionMenu(pokemon) {
  const menu = document.querySelectorAll(".select-menu");

  menu.forEach((element) => {
    element.addEventListener("click", () => {
      switch (element.id) {
        case "description-menu":
          console.log("click", element.id);
          handleDescriptionCLick(pokemon);
          break;
        case "statics-menu":
          console.log("click", element.id);
          document.querySelector("#description").classList.add("hidden");
          document.querySelector(".statics-menu").classList.remove("hidden");
          document.querySelector(".evolution-menu").classList.add("hidden");
          break;
        case "evolution-menu":
          console.log("click", element.id);
          hanldeEvolutionChainClick(pokemon);
          break;
      }
    });
  });

  setTimeout(() => {
    const target = document.querySelector("#statics-menu");
    if (target) {
      target.focus({
        preventScroll: true,
      });
    }
  }, 300);
}

async function handleDescriptionCLick(pokemon) {
  const pokeSpecies = await getPokemonByUrl(pokemon.species.url);

  const flavorEsTexts = pokeSpecies.flavor_text_entries.filter(
    (entry) => entry.language.name === "es",
  );

  const divDescription = document.createElement("div");
  divDescription.classList.add(
    "text-sm",
    "md:text-lg",
    "text-center",
    "animate-opacidad",
    "h-48",
    "mt-4",
  );
  divDescription.innerHTML =
    flavorEsTexts[Math.floor(Math.random() * flavorEsTexts.length)].flavor_text;
  document.querySelector("#description").innerHTML = "";
  document.querySelector("#description").appendChild(divDescription);
  document.querySelector("#description").classList.remove("hidden");
  document.querySelector(".statics-menu").classList.add("hidden");
  document.querySelector(".evolution-menu").classList.add("hidden");
}

async function hanldeEvolutionChainClick(pokemon) {
  const divEvolutionChain = document.querySelector(
    "#evolution-chain-container",
  );
  divEvolutionChain.innerHTML = "";
  const evolutionChainData = await handleEvolutionChain(pokemon);

  for (const [key, pokemonEv] of evolutionChainData) {
    if (pokemonEv) {
      const evolutionChainTpl = /*html*/ ` 
    <div class="flex animate-opacidad justify-between gap-5 mt-4 items-center">
        <img src="${pokemonEv.sprites.other.dream_world.front_default}" alt="ejemplo" class="size-15 md:size-30">
    </div>`;
      divEvolutionChain.insertAdjacentHTML("beforeend", evolutionChainTpl);
      divEvolutionChain.insertAdjacentHTML(
        "beforeend",
        /*html*/ `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5L16 12L8 19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
      );
    }
  }
  if (evolutionChainData.size === 0) {
    divEvolutionChain.insertAdjacentHTML(
      "beforeend",
      /*html*/ `<h2 class="font-bold md:text-lg">Este Pokémon no tiene evolución</h2>`,
    );
  }
  document.querySelector("#description").classList.add("hidden");
  document.querySelector(".statics-menu").classList.add("hidden");
  document.querySelector(".evolution-menu").classList.remove("hidden");
}
