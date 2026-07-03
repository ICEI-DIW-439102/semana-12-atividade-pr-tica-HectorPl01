// Catálogo de Filmes — Semana 12 (Fetch API + TMDB)
// Fluxo: requisição assíncrona → tratamento dos dados → renderização no DOM → interação do usuário.

const API_KEY = "ce74483925ae4b9ec563e25552681db7";

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Busca filmes na API: populares quando não há query, pesquisa por nome quando há
async function fetchMovies(query = "") {
    let url;
    if (query) {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
    } else {
        url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Falha na requisição (HTTP " + response.status + ")");
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Erro ao buscar filmes no TMDB:", error);
        showMessage("Erro ao carregar os filmes. Verifique sua conexão e a API Key no topo do script.js.");
        return null;
    }
}

// Monta o card de um filme usando apenas criação dinâmica de elementos
function createMovieCard(movie) {
    const card = document.createElement("article");
    card.classList.add("movie-card");

    if (movie.poster_path) {
        const poster = document.createElement("img");
        poster.classList.add("movie-poster");
        poster.src = IMG_BASE_URL + movie.poster_path;
        poster.alt = "Pôster do filme " + movie.title;
        poster.loading = "lazy";
        card.appendChild(poster);
    } else {
        const noPoster = document.createElement("div");
        noPoster.classList.add("movie-poster", "no-poster");
        noPoster.textContent = "🎬 Sem pôster";
        card.appendChild(noPoster);
    }

    const info = document.createElement("div");
    info.classList.add("movie-info");

    const title = document.createElement("h2");
    title.classList.add("movie-title");
    title.textContent = movie.title;
    info.appendChild(title);

    const meta = document.createElement("p");
    meta.classList.add("movie-meta");
    const year = movie.release_date ? movie.release_date.split("-")[0] : "Ano desconhecido";
    const rating = typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "—";
    meta.textContent = `${year} • ⭐ ${rating}`;
    info.appendChild(meta);

    const overview = document.createElement("p");
    overview.classList.add("movie-overview");
    const sinopse = movie.overview || "Sinopse não disponível.";
    overview.textContent = sinopse.length > 150 ? sinopse.slice(0, 150).trim() + "..." : sinopse;
    info.appendChild(overview);

    card.appendChild(info);
    return card;
}

// Limpa o container e renderiza a lista de filmes recebida
function renderMovies(movies) {
    const container = document.getElementById("movie-list");
    container.innerHTML = "";

    if (!movies || movies.length === 0) {
        showMessage("Nenhum filme encontrado.");
        return;
    }

    movies.forEach((movie) => {
        container.appendChild(createMovieCard(movie));
    });
    showMessage("");
}

// Exibe mensagens de estado (carregando, erro, lista vazia)
function showMessage(text) {
    document.getElementById("message").textContent = text;
}

// Dispara a pesquisa com o texto digitado (query vazia volta aos populares)
async function searchMovies() {
    const query = document.getElementById("search").value.trim();
    showMessage("Carregando...");
    const movies = await fetchMovies(query);
    if (movies === null) return; // erro já informado por fetchMovies
    renderMovies(movies);
}

// Carrega a lista inicial de filmes populares
async function init() {
    showMessage("Carregando...");
    const movies = await fetchMovies();
    if (movies === null) return;
    renderMovies(movies);
}

document.addEventListener("DOMContentLoaded", () => {
    init();

    document.getElementById("btnSearch").addEventListener("click", searchMovies);
    document.getElementById("search").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            searchMovies();
        }
    });
});
