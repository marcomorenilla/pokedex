
import { handleInit, handleFilter, handleSearch, handleScroll } from "./handlers.js";

async function init() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const trigger = document.querySelector("#scroll-trigger");

    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
            handleScroll()
        }
    }, {
        root: null,
        threshold: 0.1
    });

    await handleInit()
    await handleFilter(observer, trigger)


    searchBtn.addEventListener('click', async () => {
        handleSearch(observer, trigger, searchInput)

    })



    observer.observe(trigger);
}

document.addEventListener('DOMContentLoaded',  () => {


    init()


})




















