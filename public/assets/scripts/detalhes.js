// Tela de detalhes: mostra todos os dados do projeto (entidade principal)
// e as tecnologias utilizadas (entidade secundária), com favorito.

function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

async function carregarDetalhes() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        window.location.href = "index.html";
        return;
    }

    const resposta = await fetch(`${API_URL}/projetos/${id}`);
    if (!resposta.ok) {
        document.getElementById("conteudoDetalhes").innerHTML =
            `<p class="sem-resultados">Projeto não encontrado. <a href="index.html">Voltar para a home</a></p>`;
        return;
    }
    const projeto = await resposta.json();

    document.title = `${projeto.nome} - Hector.dev`;
    document.getElementById("imgDetalhe").src = projeto.imagem;
    document.getElementById("imgDetalhe").alt = `Imagem do projeto ${projeto.nome}`;
    document.getElementById("nomeDetalhe").textContent = projeto.nome;
    document.getElementById("dataDetalhe").textContent = `Publicado em ${formatarData(projeto.data)}` +
        (projeto.destaque ? " • Projeto em destaque" : "");
    document.getElementById("descricaoDetalhe").textContent = projeto.descricao;
    document.getElementById("detalhesDetalhe").textContent = projeto.detalhes || "";
    document.getElementById("linkDetalhe").href = projeto.link;

    // Entidade secundária: tecnologias do projeto
    const respTecnologias = await fetch(`${API_URL}/tecnologias`);
    const tecnologias = await respTecnologias.json();
    const tecnologiasDoProjeto = tecnologias.filter((t) => (projeto.tecnologias || []).includes(t.id));

    document.getElementById("badgesTecnologias").innerHTML = tecnologiasDoProjeto
        .map((t) => `<span class="badge-tec"><i class="${t.icone}"></i> ${t.nome}</span>`)
        .join("");
    document.getElementById("listaTecnologias").innerHTML = tecnologiasDoProjeto
        .map((t) => `<li><i class="${t.icone}"></i> <strong>${t.nome}</strong> — ${t.descricao}</li>`)
        .join("");

    await initFavorito(projeto.id);
}

async function initFavorito(projetoId) {
    const botao = document.getElementById("btnFavoritoDetalhe");
    botao.dataset.id = projetoId;

    const usuario = getUsuarioCorrente();
    if (usuario) {
        const favorito = await buscarFavorito(usuario.id, projetoId);
        botao.querySelector("i").className = (favorito ? "fas" : "far") + " fa-heart";
    }

    botao.addEventListener("click", () => cliqueFavorito(botao));
}

document.addEventListener("DOMContentLoaded", carregarDetalhes);
