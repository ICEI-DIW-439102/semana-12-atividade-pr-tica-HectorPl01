// Autenticação e cadastro de usuários contra a coleção /usuarios do JSON Server.
// O usuário autenticado é mantido na sessionStorage (chave "usuarioCorrente").

const MENSAGEM_SEM_SERVIDOR = "Não foi possível conectar ao servidor de dados. " +
    "Abra um terminal na pasta do projeto, execute \"npm start\" e acesse o site em http://localhost:3000.";

function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
}

// Gera um id único; usa fallback quando crypto.randomUUID não está disponível
function gerarId() {
    if (window.crypto && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16);
        const v = c === "x" ? r : (r % 4) + 8;
        return v.toString(16);
    });
}

async function fazerLogin(evento) {
    evento.preventDefault();
    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value;

    let usuarios;
    try {
        const resposta = await fetch(
            `${API_URL}/usuarios?login=${encodeURIComponent(login)}&senha=${encodeURIComponent(senha)}`
        );
        if (!resposta.ok) throw new Error("Resposta inválida do servidor: " + resposta.status);
        usuarios = await resposta.json();
    } catch (erro) {
        console.error("Falha ao autenticar no JSON Server:", erro);
        mostrarMensagem(MENSAGEM_SEM_SERVIDOR, "erro");
        return;
    }

    if (usuarios.length === 1) {
        const usuario = usuarios[0];
        sessionStorage.setItem("usuarioCorrente", JSON.stringify({
            id: usuario.id,
            login: usuario.login,
            nome: usuario.nome,
            email: usuario.email,
            admin: usuario.admin === true
        }));
        mostrarMensagem("Login realizado com sucesso! Redirecionando...", "sucesso");
        setTimeout(() => { window.location.href = "index.html"; }, 800);
    } else {
        mostrarMensagem("Login ou senha inválidos.", "erro");
    }
}

async function cadastrarUsuario(evento) {
    evento.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirmaSenha").value;

    if (senha !== confirmaSenha) {
        mostrarMensagem("As senhas informadas não conferem.", "erro");
        return;
    }

    try {
        const respostaExistente = await fetch(`${API_URL}/usuarios?login=${encodeURIComponent(login)}`);
        if (!respostaExistente.ok) throw new Error("Resposta inválida do servidor: " + respostaExistente.status);
        const existentes = await respostaExistente.json();
        if (existentes.length > 0) {
            mostrarMensagem("Este login já está em uso. Escolha outro.", "erro");
            return;
        }

        await fetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: gerarId(),
                login: login,
                senha: senha,
                nome: nome,
                email: email,
                admin: false
            })
        });
    } catch (erro) {
        console.error("Falha ao cadastrar usuário no JSON Server:", erro);
        mostrarMensagem(MENSAGEM_SEM_SERVIDOR, "erro");
        return;
    }

    mostrarMensagem("Usuário cadastrado com sucesso! Redirecionando para o login...", "sucesso");
    setTimeout(() => { window.location.href = "login.html"; }, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
    // Aberto direto do arquivo (file://) não há API: avisa como rodar o projeto
    if (window.location.protocol === "file:") {
        mostrarMensagem(MENSAGEM_SEM_SERVIDOR, "erro");
    }

    const formLogin = document.getElementById("formLogin");
    if (formLogin) formLogin.addEventListener("submit", fazerLogin);

    const formCadastro = document.getElementById("formCadastroUsuario");
    if (formCadastro) formCadastro.addEventListener("submit", cadastrarUsuario);
});
