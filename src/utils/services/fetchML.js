const fetchUrl = async (url) => {
    try {

        const response = await fetch(url);
        return await response.json();

    } catch (e) {

        return console.log(e);

    }
}

export const SEARCH_ITEMS = async (query) => {
    return await fetchUrl(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`);
}