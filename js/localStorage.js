import { state } from "./state.js";

/** --- Almacenamiento local --- */

export function addToLocalStorage(pokemon) {
  console.log("addToLocalStorage", pokemon.id);
  state.favorites.push(pokemon.id);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}

export function removeFromLocalStorage(pokemon) {
  console.log("removeFromLocalStorage", pokemon.id);
  state.favorites = state.favorites.filter((id) => pokemon.id != id);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}
