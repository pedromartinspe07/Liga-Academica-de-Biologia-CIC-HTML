// Importa as funções necessárias dos SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Sua configuração do app Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDaAawNtQVo1ovIPGyN_LlTeR5KquZDfJ8",
    authDomain: "labic-html.firebaseapp.com",
    projectId: "labic-html",
    storageBucket: "labic-html.firebasestorage.app",
    messagingSenderId: "283475569681",
    appId: "1:283475569681:web:266a4f6cb5806a7d2e55b0",
    measurementId: "G-PXYHN7HKSF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lógica de Cadastro (para o arquivo cadastro.html)
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Usuário cadastrado:", userCredential.user);
                // REDIRECIONA PARA A PÁGINA DE PERFIL APÓS O CADASTRO
                window.location.href = "perfil.html";
            })
            .catch((error) => {
                console.error("Erro no cadastro:", error.message);
                alert(error.message);
            });
    });
}

// Lógica de Login (para o arquivo login.html)
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Login realizado:", userCredential.user);
                // REDIRECIONA PARA A PÁGINA DE PERFIL APÓS O LOGIN
                window.location.href = "perfil.html";
            })
            .catch((error) => {
                console.error("Erro no login:", error.message);
                alert(error.message);
            });
    });
}

// Lógica para a Página de Perfil (para o arquivo perfil.html)
const logoutButton = document.getElementById('logout-button');
const userEmailDisplay = document.getElementById('user-email-display');
const userIdDisplay = document.getElementById('user-id-display');

// Adiciona um listener para o botão de Sair
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Sair da conta bem-sucedido. Redireciona para a página de login
            console.log("Sair da conta realizado com sucesso.");
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Erro ao sair:", error.message);
            alert("Erro ao sair: " + error.message);
        });
    });
}

// Monitora o estado da autenticação para atualizar a página de perfil
onAuthStateChanged(auth, (user) => {
    // Se o usuário não estiver logado e a página atual for a de perfil, redireciona
    if (!user && window.location.pathname.endsWith("perfil.html")) {
        window.location.href = "login.html";
    }

    // Se o usuário estiver logado e a página atual for a de perfil, exibe as informações
    if (user && window.location.pathname.endsWith("perfil.html")) {
        userEmailDisplay.textContent = user.email;
        userIdDisplay.textContent = user.uid;
    }
});