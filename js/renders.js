import { typeColors, traduccionTipos, traduccionStats } from "./shared.js";

/** -- Generadores de contenido --- */
export async function renderUi(data, actions) {
  const gridSection = document.querySelector("#grid-card-section");
  if (!data.append) {
    gridSection.innerHTML = "";
  }

  renderDataList(data.pokemon);
  renderCardV2(data.pokemon, actions, "#grid-card-section");
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

export function renderCardV2(pokemon, actions, sectionName) {
  const { onIsFavorite, onFavoriteClick, onAddToTeam, onSelectionMenu } =
    actions;

  const onShowDetails = {
    pokemon,
    onSelectionMenu,
  };

  const gridSection = document.querySelector(`${sectionName}`);
  const sprites = pokemon.sprites ? pokemon.sprites : pokemon.front_default;

  const types = pokemon.types.map((type) => type.type.name);

  let isFavorite = onIsFavorite(pokemon);

  const cartTpl = /*html */ `
    <article  class=" md:w-[30vh] flex flex-col relative justify-between rounded-lg animate-opacidad bg-linear-to-br from-(--poke-ice)/30 to-(--poke-white) shadow-sm hover:shadow-lg hover:shadow-yellow-500 cursor-pointer">
    <div 
      id="responsive-add-${pokemon.id}" 
      class="lg:hidden absolute z-2 top-0 right-1 font-bold w-fit bg-white p-1 ${sectionName === "#grid-card-section" ? "" : "hidden"}"
    >
      +
    </div>
    <div id="card-${pokemon.id}" data-id="${pokemon.id}" data-name="${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}" data-sprite="${sprites.other.dream_world.front_default}" draggable="true" class="draggable flex relative w-auto h-auto flex-col  items-center">
            <section class="bg-white size-full flex justify-center py-2 px-2 rounded-b-lg">
                <img src="${sprites.other.dream_world.front_default}" alt="pokemon" class="size-${sectionName == "#grid-card-section" ? 30 : 15} z-1">
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
                class=${sectionName == "#grid-card-section" ? "" : "hidden"}
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
  console.log("grid-section v2", cartTpl);
  const showMore = document.querySelector(`#card-${pokemon.id}`);

  const corazonSvg = document.getElementById(`heart-${pokemon.id}`);
  const pathCorazon = document.getElementById(`path-corazon-${pokemon.id}`);

  corazonSvg.addEventListener("click", () => {
    isFavorite = !isFavorite;
    onFavoriteClick(pokemon, isFavorite);

    if (isFavorite) {
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

async function renderDetails(onShowDetails) {
  const { pokemon, onSelectionMenu } = onShowDetails;
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

                <div class="flex flex-col md:flex-row m-auto gap-2 w-fit font-bold md:text-xl border-b border-b-(--poke-gray) mt-3 justify-center items-center">
                <button id="description-menu" class="outline-none select-menu p-1 hover:cursor-pointer focus:text-blue-700">Descripción</button>
                <button id="statics-menu" class="outline-none select-menu p-1 hover:cursor-pointer focus:text-blue-700">Estadísticas</button>
                <button id="evolution-menu"class="outline-none select-menu p-1 hover:cursor-pointer focus:text-blue-700">Cadena de evolución</button>
                </div>

                <div class="mt-2 h-48 flex statics-menu flex-col gap-2 items-center">
                   ${renderStats(stats)}
                </div>

                <div id="description"></div>

                <div id="evolution-chain" class="p-5 hidden h-48 evolution-menu  flex-col justify-center w-full items-center"> 
                <div id="evolution-chain-container" class="flex  justify-between lg:w-3/5 m-auto [&_svg]:last:hidden items-center"></div>
                </div>

                <div id="pokemon-stats-height-weight" class="flex  gap-3 justify-center px-4 mt-5">

                </div>


    
            </div>  

            <button id="btn-close-stats" class=" p-1 bg-(--poke-yellow) font-bold text-xl rounded text-white hover:bg-yellow-700 mb-5 ">Cerrar</button>


        </div>
    `;

  stastDialog.insertAdjacentHTML("beforeend", detailsTpl);
  stastDialog.classList.toggle("hidden");
  document.querySelector("body").classList.add("overflow-hidden");

  renderHeightAndWeight(pokemon);

  onSelectionMenu(pokemon);

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
                        <h2 class="font-bold md:text-xl px-2 ">Altura:<span class="font-normal">${height}m</span></h2>
                        <h2 class="font-bold md:text-xl px-2 ">Peso:<span class="font-normal">${weight}kg</span></h2>
    
`;
  section.insertAdjacentHTML("beforeend", heightAndWeightTpl);
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
