// Script da home-page: carrossel de destaques, cards com pesquisa e
// favoritos, gráfico de tecnologias e formulário de contato.
let todosProjetos = [];
let idsFavoritos = new Set();

async function carregarDados() {
    const resposta = await fetch(`${API_URL}/projetos`);
    todosProjetos = await resposta.json();

    const usuario = getUsuarioCorrente();
    if (usuario) {
        const respFavoritos = await fetch(`${API_URL}/favoritos?usuarioId=${usuario.id}`);
        const favoritos = await respFavoritos.json();
        idsFavoritos = new Set(favoritos.map((f) => Number(f.itemId)));
    }

    montarCarrossel(todosProjetos.filter((p) => p.destaque));
    exibirCards(todosProjetos);
    montarGrafico();
}

// ===== Seção 1: carrossel de destaques =====

function montarCarrossel(destaques) {
    const track = document.getElementById("carouselTrack");
    track.innerHTML = destaques.map((p) => `
        <li class="carousel-slide">
            <div class="project-card">
                <a href="detalhes.html?id=${p.id}">
                    <img src="${p.imagem}" alt="${p.nome}">
                    <p><strong>${p.nome}</strong></p>
                    <p class="slide-desc">${p.descricao}</p>
                </a>
            </div>
        </li>`).join("");

    const slides = Array.from(track.children);
    let indiceAtual = 0;

    function atualizarPosicao() {
        if (slides.length === 0) return;
        const larguraSlide = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(${-larguraSlide * indiceAtual}px)`;
    }

    document.querySelector(".carousel-control.next").addEventListener("click", () => {
        if (indiceAtual < slides.length - 1) {
            indiceAtual++;
            atualizarPosicao();
        }
    });

    document.querySelector(".carousel-control.prev").addEventListener("click", () => {
        if (indiceAtual > 0) {
            indiceAtual--;
            atualizarPosicao();
        }
    });
}

// ===== Seção 2: cards com pesquisa e favoritos =====

function exibirCards(projetos) {
    const container = document.getElementById("cardsContainer");

    if (projetos.length === 0) {
        container.innerHTML = `<p class="sem-resultados">Nenhum projeto encontrado para a pesquisa.</p>`;
        return;
    }

    container.innerHTML = projetos.map((p) => `
        <div class="card-projeto">
            <button class="btn-favorito" data-id="${p.id}" title="Marcar/desmarcar favorito">
                <i class="${idsFavoritos.has(p.id) ? "fas" : "far"} fa-heart"></i>
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
            const favoritado = await cliqueFavorito(botao);
            if (favoritado === null) return;
            const id = Number(botao.dataset.id);
            if (favoritado) idsFavoritos.add(id);
            else idsFavoritos.delete(id);
        });
    });
}

function filtrarProjetos() {
    const texto = document.getElementById("campoPesquisa").value.trim().toLowerCase();
    if (!texto) {
        exibirCards(todosProjetos);
        return;
    }
    exibirCards(todosProjetos.filter((p) =>
        p.nome.toLowerCase().includes(texto) ||
        p.descricao.toLowerCase().includes(texto)
    ));
}

// ===== Seção 3: visualização avançada (gráfico) =====

async function montarGrafico() {
    const resposta = await fetch(`${API_URL}/tecnologias`);
    const tecnologias = await resposta.json();

    const rotulos = [];
    const contagens = [];
    tecnologias.forEach((tec) => {
        const quantidade = todosProjetos.filter((p) => p.tecnologias.includes(tec.id)).length;
        if (quantidade > 0) {
            rotulos.push(tec.nome);
            contagens.push(quantidade);
        }
    });

    new Chart(document.getElementById("graficoTecnologias"), {
        type: "bar",
        data: {
            labels: rotulos,
            datasets: [{
                label: "Quantidade de projetos",
                data: contagens,
                backgroundColor: ["#e44d26", "#264de4", "#f7df1e", "#68217a", "#00758f", "#2e8b57"]
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

// ===== Formulário de contato =====

function initContato() {
    const formulario = document.getElementById("contactForm");
    if (!formulario) return;

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("phone").value;
        const mensagem = document.getElementById("formMessage");

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            mensagem.textContent = "Por favor, insira um email válido.";
            return;
        }

        const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!telefoneRegex.test(telefone)) {
            mensagem.textContent = "Por favor, insira um telefone válido.";
            return;
        }

        mensagem.textContent = "Formulário enviado com sucesso!";
        formulario.reset();
    });

    document.getElementById("phone").addEventListener("input", (evento) => {
        let valor = evento.target.value.replace(/\D/g, "");
        if (valor.length <= 10) {
            evento.target.value = valor.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        } else {
            evento.target.value = valor.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    initContato();

    const campoPesquisa = document.getElementById("campoPesquisa");
    campoPesquisa.addEventListener("input", filtrarProjetos);
    document.getElementById("formPesquisa").addEventListener("submit", (evento) => {
        evento.preventDefault();
        filtrarProjetos();
    });
});
