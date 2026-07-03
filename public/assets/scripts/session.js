// Utilidades compartilhadas por todas as telas: sessão do usuário,
// menu dinâmico, tema claro/escuro e favoritos no JSON Server.
// A API é servida na mesma origem do site (npm start -> json-server --static).
const API_URL = "";

function getUsuarioCorrente() {
    const dados = sessionStorage.getItem("usuarioCorrente");
    return dados ? JSON.parse(dados) : null;
}

function logout() {
    sessionStorage.removeItem("usuarioCorrente");
    window.location.href = "index.html";
}

// Mostra/esconde itens do menu conforme o status do usuário logado
function atualizarMenu() {
    const usuario = getUsuarioCorrente();
    const menuCadastroItens = document.getElementById("menuCadastroItens");
    const menuFavoritos = document.getElementById("menuFavoritos");
    const menuLogin = document.getElementById("menuLogin");
    const menuUsuario = document.getElementById("menuUsuario");
    const menuLogout = document.getElementById("menuLogout");

    if (usuario) {
        if (menuFavoritos) menuFavoritos.classList.remove("hidden");
        if (menuLogout) menuLogout.classList.remove("hidden");
        if (menuLogin) menuLogin.classList.add("hidden");
        if (usuario.admin && menuCadastroItens) {
            menuCadastroItens.classList.remove("hidden");
        }
        if (menuUsuario) {
            menuUsuario.classList.remove("hidden");
            const nomeUsuario = document.getElementById("nomeUsuario");
            if (nomeUsuario) nomeUsuario.textContent = "Olá, " + usuario.nome.split(" ")[0];
        }
    }

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (evento) => {
            evento.preventDefault();
            logout();
        });
    }
}

// Tema claro/escuro persistido no localStorage
function initTema() {
    const toggleButton = document.getElementById("togglebutton");
    const toggleimg = document.getElementById("toggleimg");
    if (!toggleButton || !toggleimg) return;

    function aplicarTema(tema) {
        document.body.setAttribute("data-theme", tema);
        toggleimg.src = tema === "dark" ? "assets/img/sun.png" : "assets/img/moon.png";
        localStorage.setItem("tema", tema);
    }

    aplicarTema(localStorage.getItem("tema") || "light");

    toggleButton.addEventListener("click", () => {
        const atual = document.body.getAttribute("data-theme");
        aplicarTema(atual === "dark" ? "light" : "dark");
    });
}

// Retorna o registro de favorito do usuário para um item, ou null
async function buscarFavorito(usuarioId, itemId) {
    const resposta = await fetch(`${API_URL}/favoritos?usuarioId=${usuarioId}`);
    const favoritos = await resposta.json();
    return favoritos.find((f) => Number(f.itemId) === Number(itemId)) || null;
}

// Marca/desmarca o item como favorito do usuário logado.
// Retorna true se o item ficou favoritado, false se deixou de ser.
async function alternarFavorito(itemId) {
    const usuario = getUsuarioCorrente();
    if (!usuario) return null;

    const existente = await buscarFavorito(usuario.id, itemId);
    if (existente) {
        await fetch(`${API_URL}/favoritos/${existente.id}`, { method: "DELETE" });
        return false;
    }
    await fetch(`${API_URL}/favoritos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, itemId: Number(itemId) })
    });
    return true;
}

// Tratamento padrão do clique no coração: exige login e alterna no servidor
async function cliqueFavorito(botao) {
    const usuario = getUsuarioCorrente();
    if (!usuario) {
        if (confirm("Você precisa estar logado para favoritar. Ir para a tela de login?")) {
            window.location.href = "login.html";
        }
        return null;
    }
    const favoritado = await alternarFavorito(botao.dataset.id);
    const icone = botao.querySelector("i");
    if (icone) icone.className = (favoritado ? "fas" : "far") + " fa-heart";
    return favoritado;
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarMenu();
    initTema();
});
