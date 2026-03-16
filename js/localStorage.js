import { state } from "./state.js";

/** --- Almacenamiento local --- */

export function addToLocalStorage(pokemon) {
  state.favorites.push(pokemon.id);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}

export function removeFromLocalStorage(pokemon) {
  state.favorites = state.favorites.filter((id) => pokemon.id != id);
  localStorage.setItem("favorites", JSON.stringify(state.favorites));
}
