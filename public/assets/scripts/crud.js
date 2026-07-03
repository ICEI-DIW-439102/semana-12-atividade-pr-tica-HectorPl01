// CRUD de projetos (apenas administradores): inserir, alterar,
// excluir e listar os itens da coleção /projetos do JSON Server.

function mostrarMensagemCrud(texto, tipo) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
}

async function carregarTecnologias() {
    const resposta = await fetch(`${API_URL}/tecnologias`);
    const tecnologias = await resposta.json();
    document.getElementById("checksTecnologias").innerHTML = tecnologias.map((t) => `
        <label><input type="checkbox" name="tecnologia" value="${t.id}"> ${t.nome}</label>
    `).join("");
}

async function listarProjetos() {
    const resposta = await fetch(`${API_URL}/projetos`);
    const projetos = await resposta.json();

    document.getElementById("tabelaProjetos").innerHTML = projetos.map((p) => `
        <tr>
            <td><img src="${p.imagem}" alt="${p.nome}"></td>
            <td>${p.nome}</td>
            <td>${p.data || ""}</td>
            <td>${p.destaque ? "Sim" : "Não"}</td>
            <td>
                <button class="btn btn-primario btn-editar" data-id="${p.id}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn btn-perigo btn-excluir" data-id="${p.id}" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join("");

    document.querySelectorAll(".btn-editar").forEach((botao) => {
        botao.addEventListener("click", () => editarProjeto(botao.dataset.id));
    });
    document.querySelectorAll(".btn-excluir").forEach((botao) => {
        botao.addEventListener("click", () => excluirProjeto(botao.dataset.id));
    });
}

function lerFormulario() {
    return {
        nome: document.getElementById("nome").value.trim(),
        descricao: document.getElementById("descricao").value.trim(),
        detalhes: document.getElementById("detalhes").value.trim(),
        imagem: document.getElementById("imagem").value.trim(),
        link: document.getElementById("link").value.trim(),
        data: document.getElementById("data").value,
        destaque: document.getElementById("destaque").checked,
        tecnologias: Array.from(document.querySelectorAll('input[name="tecnologia"]:checked'))
            .map((c) => Number(c.value))
    };
}

function limparFormulario() {
    document.getElementById("formProjeto").reset();
    document.getElementById("projetoId").value = "";
    document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-save"></i> Cadastrar';
    mostrarMensagemCrud("", "");
}

async function salvarProjeto(evento) {
    evento.preventDefault();
    const idEdicao = document.getElementById("projetoId").value;
    const projeto = lerFormulario();

    if (idEdicao) {
        projeto.id = Number(idEdicao);
        await fetch(`${API_URL}/projetos/${idEdicao}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projeto)
        });
    } else {
        await fetch(`${API_URL}/projetos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projeto)
        });
    }

    limparFormulario();
    mostrarMensagemCrud(idEdicao ? "Projeto alterado com sucesso!" : "Projeto cadastrado com sucesso!", "sucesso");
    await listarProjetos();
}

async function editarProjeto(id) {
    const resposta = await fetch(`${API_URL}/projetos/${id}`);
    const projeto = await resposta.json();

    document.getElementById("projetoId").value = projeto.id;
    document.getElementById("nome").value = projeto.nome;
    document.getElementById("descricao").value = projeto.descricao;
    document.getElementById("detalhes").value = projeto.detalhes || "";
    document.getElementById("imagem").value = projeto.imagem;
    document.getElementById("link").value = projeto.link || "";
    document.getElementById("data").value = projeto.data || "";
    document.getElementById("destaque").checked = projeto.destaque === true;
    document.querySelectorAll('input[name="tecnologia"]').forEach((check) => {
        check.checked = (projeto.tecnologias || []).includes(Number(check.value));
    });

    document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-save"></i> Salvar alterações';
    document.getElementById("formProjeto").scrollIntoView({ behavior: "smooth" });
}

async function excluirProjeto(id) {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    await fetch(`${API_URL}/projetos/${id}`, { method: "DELETE" });

    // Remove também os favoritos que apontavam para o projeto excluído
    const resposta = await fetch(`${API_URL}/favoritos`);
    const favoritos = await resposta.json();
    const orfaos = favoritos.filter((f) => Number(f.itemId) === Number(id));
    for (const favorito of orfaos) {
        await fetch(`${API_URL}/favoritos/${favorito.id}`, { method: "DELETE" });
    }

    mostrarMensagemCrud("Projeto excluído.", "sucesso");
    await listarProjetos();
}

document.addEventListener("DOMContentLoaded", async () => {
    const usuario = getUsuarioCorrente();
    if (!usuario || usuario.admin !== true) {
        alert("Acesso restrito: apenas administradores podem cadastrar projetos.");
        window.location.href = "index.html";
        return;
    }

    await carregarTecnologias();
    await listarProjetos();

    document.getElementById("formProjeto").addEventListener("submit", salvarProjeto);
    document.getElementById("btnLimpar").addEventListener("click", limparFormulario);
});
