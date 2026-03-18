import { typeColors, traduccionTipos, traduccionStats } from "./shared.js";

/** -- Generadores de contenido --- */
export async function renderUi(data, actions) {
  const gridSection = document.querySelector("#grid-card-section");
  if (!data.append) {
    gridSection.innerHTML = "";
  }

  renderDataList(data.pokemon);
  renderCard(data.pokemon, actions);
}

export function renderTypes(types) {
  const typesSection = document.querySelector("#types-section");

  types.forEach((type) => {
    const typeTpl = /*html*/ `
        <button id="${type.name}" class="type-btn font-bold bg-[var(${typeColors[type.name]})] animate-opacidad text-white p-1 hover:bg-white hover:border-3 hover:shadow-lg hover:border-[var(${typeColors[type.name]})] hover:text-[var(${typeColors[type.name]})] rounded-full cursor-pointer">${traduccionTipos[type.name]}</button>
        `;
    const typeBtn = renderBadgeType(type.name, typeTpl);
    typesSection.insertAdjacentHTML("beforeend", typeBtn);
  });

  const btnFavs = /*html*/ `<button id="favs" class="type-btn font-bold bg-[var(${typeColors["favs"]})] animate-opacidad text-white p-1 hover:bg-white hover:border-3 hover:shadow-lg hover:border-[var(${typeColors["favs"]})] hover:text-[var(${typeColors["favs"]})] rounded-full cursor-pointer">Favoritos</button>`;
  typesSection.insertAdjacentHTML(
    "beforeend",
    renderBadgeType("favs", btnFavs),
  );

  const btnTodos = /*html*/ `
        <button id="todos" class="type-btn font-bold bg-[var(${typeColors["todos"]})] animate-opacidad text-white p-1 hover:bg-white hover:border-3 hover:shadow-lg hover:border-[var(${typeColors["todos"]})] hover:text-[var(${typeColors["todos"]})] rounded-full cursor-pointer">Todos</button>
        `;
  typesSection.insertAdjacentHTML(
    "beforeend",
    renderBadgeType("todos", btnTodos),
  );
}

function renderDataList(pokemon) {
  const dataList = document.querySelector("#pokemon-list");
  const optionTpl = `<option value=${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}></option>`;
  dataList.insertAdjacentHTML("beforeend", optionTpl);
}

export function renderCard(pokemon, actions) {
  const { onIsFavorite, onFavoriteClick, onShowEvolutionChain, onAddToTeam } =
    actions;

  const onShowDetails = {
    pokemon,
    onShowEvolutionChain,
  };

  const gridSection = document.querySelector("#grid-card-section");
  const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default;

  const types = pokemon.types.map((type) => type.type.name);

  const isFavorite = onIsFavorite(pokemon);

  const cartTpl = /*html */ `
    <article  class="relative flex flex-col justify-between gap-3 rounded-lg animate-opacidad bg-linear-to-br from-(--poke-ice)/30 to-(--poke-white)  shadow-sm hover:shadow-lg hover:shadow-yellow-500 cursor-pointer">
    <div id="responsive-add-${pokemon.id}" class="lg:hidden absolute z-2 top-0 right-1 font-bold w-fit bg-white cursor-pointer hover:text-lg  p-1">+</div>
    <div id="card-${pokemon.id}" data-id="${pokemon.id}" data-name="${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}" data-sprite="${sprites.other.dream_world.front_default}" draggable="true" class="draggable cursor-grab flex relative w-auto h-auto flex-col  items-center">
            <section class="bg-white relative size-full flex justify-center py-2 px-2 rounded-b-lg">
            
                <img src="${sprites.other.dream_world.front_default}" alt="pokemon" class="pointer-events-none size-30 z-1">
            </section>

            <div class="p-2">

                <section id="name-container" class="flex justify-center gap-1">
                    <h2 class="font-bold text-xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                </section>
                <section id="type-container" class="flex flex-wrap font-bold justify-center gap-1">
                                    ${types
                                      .map((type) => {
                                        const typeElement = `<p class="text-xs">${traduccionTipos[type]}</p>`;
                                        return renderBadgeType(
                                          type,
                                          typeElement,
                                        );
                                      })
                                      .join("")}
                </section>
            </div>
        </div>
        <div class="flex justify-between bg-linear-to-r from-(--poke-yellow) to-(--poke-white) cursor-[url('/assets/cursor-2.svg'),_default] p-1">
            <section id="number-container" class="px-3">
                <h2 class="font-bold text-lg">#${String(pokemon.id).padStart(3, "0")}</h2>
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
                    fill="${isFavorite ? "#cc0000" : "none"}"
                    stroke="#CC0000" 
                    stroke-width="2"
                />
            </svg>
        </div>
    </article>
    `;
  gridSection.insertAdjacentHTML("beforeend", cartTpl);
  const showMore = document.querySelector(`#card-${pokemon.id}`);

  const corazonSvg = document.getElementById(`heart-${pokemon.id}`);
  const pathCorazon = document.getElementById(`path-corazon-${pokemon.id}`);

  corazonSvg.addEventListener("click", () => {
    onFavoriteClick(pokemon, isFavorite);

    if (!isFavorite) {
      pathCorazon.setAttribute("fill", "#cc0000");
      corazonSvg.style.transform = "scale(1.2)";
      setTimeout(() => (corazonSvg.style.transform = "scale(1)"), 100);
    } else {
      pathCorazon.setAttribute("fill", "none");
    }
  });

  const addToTeam = document.querySelector(`#responsive-add-${pokemon.id}`);
  addToTeam.addEventListener("click", () => onAddToTeam(pokemon));

  showMore.addEventListener(
    "click",
    async () => await renderDetails(onShowDetails),
  );
}

export function renderCardV2(pokemon, actions, sectionName) {
  const { onIsFavorite, onFavoriteClick, onShowEvolutionChain } = actions;

  const onShowDetails = {
    pokemon,
    onShowEvolutionChain,
  };

  const gridSection = document.querySelector(`${sectionName}`);
  const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default;

  const types = pokemon.types.map((type) => type.type.name);

  const isFavorite = onIsFavorite(pokemon);

  const cartTpl = /*html */ `
    <article  class="flex flex-col justify-between rounded-lg animate-opacidad bg-linear-to-br from-(--poke-ice)/30 to-(--poke-white) shadow-sm hover:shadow-lg hover:shadow-yellow-500 cursor-pointer">
        <div id="card-${pokemon.id}" data-id="${pokemon.id}" data-name="${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}" data-sprite="${sprites.other.dream_world.front_default}" draggable="true" class="draggable flex relative w-auto h-auto flex-col  items-center">
            <section class="bg-white size-full flex justify-center py-2 px-2 rounded-b-lg">
                <img src="${sprites.other.dream_world.front_default}" alt="pokemon" class="size-15 z-1">
            </section>

            <div class="p-2">

                <section id="name-container" class="flex justify-center gap-1">
                    <h2 class="font-bold text-xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                </section>
                <section id="type-container" class="flex flex-wrap font-bold justify-center gap-1">
                                    ${types
                                      .map((type) => {
                                        const typeElement = `<p class="text-xs">${traduccionTipos[type]}</p>`;
                                        return renderBadgeType(
                                          type,
                                          typeElement,
                                        );
                                      })
                                      .join("")}
                </section>
            </div>
        </div>
        <div class="flex justify-between bg-linear-to-r from-(--poke-yellow) to-(--poke-white) cursor-[url('/assets/cursor-2.svg'),_default] p-1">
            <section id="number-container" class="px-3">
                <h2 class="font-bold text-lg">#${String(pokemon.id).padStart(3, "0")}</h2>
            </section>
            <svg 
                id="heart-${pokemon.id}" 
                width="20px" 
                height="20px" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style="cursor: pointer; display:none;"
                >
                <path id="path-corazon-${pokemon.id}"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill="${isFavorite ? "#cc0000" : "none"}"
                    stroke="#CC0000" 
                    stroke-width="2"
                />
            </svg>
        </div>
    </article>
    `;
  gridSection.insertAdjacentHTML("beforeend", cartTpl);
  const showMore = document.querySelector(`#card-${pokemon.id}`);

  const corazonSvg = document.getElementById(`heart-${pokemon.id}`);
  const pathCorazon = document.getElementById(`path-corazon-${pokemon.id}`);

  corazonSvg.addEventListener("click", () => {
    onFavoriteClick(pokemon, isFavorite);

    if (!isFavorite) {
      pathCorazon.setAttribute("fill", "#cc0000");
      corazonSvg.style.transform = "scale(1.2)";
      setTimeout(() => (corazonSvg.style.transform = "scale(1)"), 100);
    } else {
      pathCorazon.setAttribute("fill", "none");
    }
  });

  showMore.addEventListener(
    "click",
    async () => await renderDetails(onShowDetails),
  );
}

async function renderDetails(onShowDetails) {
  const { pokemon, onShowEvolutionChain } = onShowDetails;
  const stastDialog = document.querySelector("#pokemon-stats");
  const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default;
  const types = pokemon.types.map((type) => type.type.name);
  const stats = pokemon.stats;

  console.log("click", pokemon);

  stastDialog.innerHTML = "";
  const detailsTpl = /*html*/ `
    <div class="m-auto animate-visible bg-white rounded-2xl w-5/6 overflow-y-auto max-h-[90vh] text-center shadow-2xl">
            <div class="p-5 border-b border-b-(--poke-gray) flex justify-center items-center">
                <img src="${sprites.other.dream_world.front_default}" alt="ejemplo" class="p-2 size-40">
            </div>

            <div  class="p-2 h-[50%]">
                <h2 class="font-bold md:text-4xl">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                <h2 class="font-semi-bold md:text-3xl">#${String(pokemon.id).padStart(3, "0")}</h2>

                <div id="pokemon-stats-types" class="mt-3 flex justify-center items-center font-bold gap-1 ">
                                                        ${types
                                                          .map((type) => {
                                                            const typeElement = `<p class="text-xs md:text-2xl">${traduccionTipos[type]}</p>`;
                                                            return renderBadgeType(
                                                              type,
                                                              typeElement,
                                                            );
                                                          })
                                                          .join("")}
                </div>

                <div class="flex m-auto gap-2 w-fit font-bold md:text-xl border-b border-b-(--poke-gray) mt-3 justify-center items-center">
                <div id="description-menu" class="select-menu p-1 hover:cursor-pointer focus:text-blue-700">Descripción</div>
                <div id="statics-menu" class="select-menu p-1 hover:cursor-pointer focus:text-blue-700">Estadísticas</div>
                <div id="evolution-menu"class="select-menu p-1 hover:cursor-pointer focus:text-blue-700">Cadena de evolución</div>
                </div>

                <div class="mt-2 flex statics-menu flex-col gap-2 items-center">
                   ${renderStats(stats)}
                </div>

                <div id="evolution-chain" class="p-5 hidden evolution-menu border-t border-t-(--poke-gray) flex-col justify-center w-full items-center gap-10"> 
                <h2 class="font-bold md:text-xl p-2" >Cadena de evolución:</h2>
                <div id="evolution-chain-container" class="flex   justify-between lg:w-3/5 m-auto [&_svg]:last:hidden items-center"></div>
                </div>

                <div id="pokemon-stats-height-weight" class="flex  gap-3 justify-center px-4 mt-3">

                </div>


    
            </div>  

            <button id="btn-close-stats" class=" p-1 bg-(--poke-yellow) font-bold text-xl rounded text-white hover:bg-yellow-700 mb-5 ">Cerrar</button>


        </div>
    `;

  stastDialog.insertAdjacentHTML("beforeend", detailsTpl);
  stastDialog.classList.toggle("hidden");
  document.querySelector("body").classList.add("overflow-hidden");

  renderEvolutionChain(pokemon, onShowEvolutionChain);
  renderHeightAndWeight(pokemon);

  renderSelectionMenu();

  const closeBtn = document.querySelector("#btn-close-stats");
  closeBtn.addEventListener("click", () => {
    stastDialog.classList.toggle("hidden");
    document.querySelector("body").classList.remove("overflow-hidden");
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !stastDialog.classList.contains("hidden"))
      stastDialog.classList.toggle("hidden");
  });
}

async function renderEvolutionChain(pokemon, onShowEvolutionChain) {
  const divEvolutionChain = document.querySelector(
    "#evolution-chain-container",
  );
  const evolutionChainData = await onShowEvolutionChain(pokemon);

  for (const [key, pokemonEv] of evolutionChainData) {
    if (pokemonEv) {
      const evolutionChainTpl = /*html*/ ` 
    <div class="flex justify-between gap-5  items-center">
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
}

function renderBadgeType(type, element) {
  const badgeTpl = /*html*/ `
    <div class="bg-[var(${typeColors[type]})] h-fit w-fit text-white p-1 rounded-full flex  px-5 items-center justify-center gap-1">
        <img src="./assets/icons/${type}.svg" class="size-4" alt="icono no encontrado">
        ${element}
    </div>`;

  return badgeTpl;
}

function renderStats(stats) {
  return `
    ${stats
      .map((stat) => {
        let color = "bg-green-500";

        if (stat.base_stat < 30) color = "bg-red-500";
        else if (stat.base_stat < 50) color = "bg-yellow-500";

        return `<div class="leading-none grid grid-cols-2 gap-1 w-48 md:w-96 items-center content-start">
                    
                    <h2 class="md:text-lg text-start font-medium">${traduccionStats[stat.stat.name]}</h2>

                        <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="${color} animate-stat h-full rounded-full w-[${stat.base_stat}%]">
                        </div>
                    </div>
                </div>`;
      })
      .join("")}`;
}

function renderHeightAndWeight(pokemon) {
  const section = document.querySelector("#pokemon-stats-height-weight");
  const height = pokemon.height / 10;
  const weight = pokemon.weight / 10;

  const heightAndWeightTpl = /*html*/ `
                        <h2 class="font-bold md:text-xl px-2 border-r border-l ">Altura:<span class="font-normal">${height}m</span></h2>
                        <h2 class="font-bold md:text-xl px-2 border-r border-l ">Peso:<span class="font-normal">${weight}kg</span></h2>
    
`;
  section.insertAdjacentHTML("beforeend", heightAndWeightTpl);
}

function renderSelectionMenu() {
  const menu = document.querySelectorAll(".select-menu");

  menu.forEach((element) => {
    element.addEventListener("click", () => {
      console.log("click", element.id);
    });
  });
}

export function renderNoContentDialog() {
  const noContentDialog = document.querySelector("#no-content-dialog");
  const noContentDialogBtn = document.querySelector(".no-content-dialog-btn");
  noContentDialog.showModal();

  noContentDialogBtn.addEventListener("click", () => {
    noContentDialog.close();
  });
}

export function renderDragZone(team, onDrag) {
  const dragSection = document.querySelector("#drag-section");
  dragSection.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    if (i < team.length) {
      const pokemonDragged = /*html*/ `
        <article
          id="team-card-${i}"
          class="team-card h-[200px]  items-center justify-center flex flex-col rounded-sm bg-white">
          <div class="text-center text-(--poke-yellow) font-bold">
        <div>
        <img id="img-team-${i}" src="${team[i].sprite}" alt="pokedata" class="m-auto size-15">
        </div>
        <div id="name-team-${i}" class="font-bold text-(--poke-yellow)">${team[i].name}</div>
          </div>
        </article>
    `;
      dragSection.insertAdjacentHTML("beforeend", pokemonDragged);
    } else {
      const defaultDrag = /*html*/ `
        <article
        id="team-card-${i}"
          class="team-card h-[200px] items-center justify-center flex flex-col rounded-sm bg-white">
          <div class="text-center text-(--poke-yellow) font-bold">
        <div>
            +
        </article>`;

      dragSection.insertAdjacentHTML("beforeend", defaultDrag);
    }
  }
  onDrag();
}
