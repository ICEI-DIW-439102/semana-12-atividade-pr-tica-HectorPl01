// Página de favoritos: lista os projetos favoritados pelo usuário logado.

async function carregarFavoritos() {
    const usuario = getUsuarioCorrente();
    const container = document.getElementById("listaFavoritos");

    document.getElementById("saudacaoFavoritos").textContent =
        `${usuario.nome}, estes são os projetos que você marcou como favoritos. Clique no coração para remover.`;

    const respFavoritos = await fetch(`${API_URL}/favoritos?usuarioId=${usuario.id}`);
    const favoritos = await respFavoritos.json();

    if (favoritos.length === 0) {
        container.innerHTML = `<p class="sem-resultados">Você ainda não marcou nenhum projeto como favorito.
            <a href="index.html#projetos">Explore os projetos</a> e clique no coração para favoritar.</p>`;
        return;
    }

    const respProjetos = await fetch(`${API_URL}/projetos`);
    const projetos = await respProjetos.json();
    const meusFavoritos = projetos.filter((p) =>
        favoritos.some((f) => Number(f.itemId) === Number(p.id))
    );

    container.innerHTML = meusFavoritos.map((p) => `
        <div class="card-projeto">
            <button class="btn-favorito" data-id="${p.id}" title="Remover dos favoritos">
                <i class="fas fa-heart"></i>
            </button>
            <a href="detalhes.html?id=${p.id}">
                <img src="${p.imagem}" alt="${p.nome}">
                <div class="card-body">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao}</p>
                </div>
            </a>
        </div>`).join("");

    container.querySelectorAll(".btn-favorito").forEach((botao) => {
        botao.addEventListener("click", async () => {
            await alternarFavorito(botao.dataset.id);
            await carregarFavoritos();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = getUsuarioCorrente();
    if (!usuario) {
        alert("Faça login para ver seus favoritos.");
        window.location.href = "login.html";
        return;
    }
    carregarFavoritos();
});
