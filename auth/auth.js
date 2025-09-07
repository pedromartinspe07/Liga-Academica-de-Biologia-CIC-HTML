// auth.js
// Autenticação e Funções do Firestore para o LABIC

// Importa as funções necessárias dos SDKs do Firebase (v10.11.1 - versão mais recente)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider, 
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// --- 1. Configuração do Firebase ---
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

// Inicializa o Firebase e os serviços de Autenticação e Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta o 'app' e 'auth' para que outros módulos (como perfil.js) possam usá-los
export { app, auth };

// Cache de elementos do DOM para evitar buscas repetidas
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const googleSignInButton = document.getElementById('google-signin-button');
const statusMessage = document.getElementById('status-message'); // Adicione este elemento no seu HTML

// Função para exibir mensagens de status
function showStatusMessage(message, type) {
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `alert alert-${type}`;
        statusMessage.style.display = 'block';
    }
}

// --- 2. Gerenciadores de Formulários e Botões ---

// Lógica de Cadastro (para cadastro.html)
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showStatusMessage("Cadastrando...", "info");
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const serie = document.getElementById('register-serie').value;
        const turma = document.getElementById('register-turma').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log("Usuário cadastrado com e-mail:", user);
            
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                name: name,
                email: email,
                role: "pendente",
                serie: serie,
                turma: turma,
                photoURL: user.photoURL || 'assets/images/default-avatar.png'
            });
            
            showStatusMessage("Cadastro realizado com sucesso!", "success");
            window.location.href = "aprovacao_pendente.html";
        } catch (error) {
            console.error("Erro no cadastro:", error.message);
            showStatusMessage("Erro ao cadastrar: " + error.message, "danger");
        }
    });
}

// Lógica de Cadastro e Login com Google
if (googleSignInButton) {
    googleSignInButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            console.log("Usuário logado com Google:", user);

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    name: user.displayName || 'Usuário',
                    email: user.email,
                    photoURL: user.photoURL || 'assets/images/default-avatar.png',
                    role: "pendente",
                    serie: null,
                    turma: null,
                });
            }
            // O onAuthStateChanged lidará com o redirecionamento
            showStatusMessage("Login com Google realizado com sucesso!", "success");
        } catch (error) {
            console.error("Erro no login com Google:", error.message);
            showStatusMessage("Erro ao fazer login com Google: " + error.message, "danger");
        }
    });
}

// Lógica de Login (para login.html)
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showStatusMessage("Autenticando...", "info");
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login realizado:", userCredential.user);
            // O onAuthStateChanged vai lidar com o redirecionamento
            showStatusMessage("Login realizado com sucesso!", "success");
        } catch (error) {
            console.error("Erro no login:", error.message);
            showStatusMessage("Erro ao fazer login: " + error.message, "danger");
        }
    });
}

// Lógica de Logout (para perfil.html e painel.html)
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("Sair da conta realizado com sucesso.");
            window.location.href = "login.html";
        } catch (error) {
            console.error("Erro ao sair:", error.message);
            showStatusMessage("Erro ao sair: " + error.message, "danger");
        }
    });
}

// --- 3. Monitoramento do Estado de Autenticação e Redirecionamento ---
// Esta função é executada sempre que o estado de autenticação muda
onAuthStateChanged(auth, async (user) => {
    // Esconde a mensagem de status após o carregamento
    if (statusMessage) statusMessage.style.display = 'none';

    const navLoginLink = document.getElementById('nav-login-link');
    const navCadastroLink = document.getElementById('nav-cadastro-link');
    const navPerfilLink = document.getElementById('nav-perfil-link');
    const navPainelLink = document.getElementById('nav-painel-link');

    // Se o usuário está logado
    if (user) {
        // Esconde Login/Cadastro e exibe Perfil
        if (navLoginLink) navLoginLink.classList.add('d-none');
        if (navCadastroLink) navCadastroLink.classList.add('d-none');
        if (navPerfilLink) navPerfilLink.classList.remove('d-none');
        
        // Verifica o cargo do usuário no Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        const authorizedRoles = ['editor', 'editorChefe', 'developer'];

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;

            // Exibe o link do painel se o cargo for autorizado
            if (navPainelLink && authorizedRoles.includes(role)) {
                navPainelLink.classList.remove('d-none');
            }

            // Redireciona com base no cargo do usuário se ele estiver em uma página de login/cadastro
            const path = window.location.pathname;
            if (path.endsWith("cadastro.html") || path.endsWith("login.html")) {
                if (role === 'pendente') {
                    window.location.href = "aprovacao_pendente.html";
                } else if (authorizedRoles.includes(role) || role === 'membro') {
                    window.location.href = "perfil.html";
                }
            }

            // Redireciona para o login se tentar acessar o painel sem permissão
            if (path.endsWith("painel.html") && !authorizedRoles.includes(role)) {
                alert("Acesso negado. Você não tem permissão para acessar o painel de controle.");
                window.location.href = "perfil.html";
            }
        } else {
            // Se o documento não existe (caso de cadastro com Google), redireciona para a página de aprovação pendente
            if (!window.location.pathname.endsWith("aprovacao_pendente.html")) {
                window.location.href = "aprovacao_pendente.html";
            }
        }
    } else {
        // Se o usuário não está logado, esconde links de perfil e painel e exibe login/cadastro
        if (navPerfilLink) navPerfilLink.classList.add('d-none');
        if (navPainelLink) navPainelLink.classList.add('d-none');
        if (navLoginLink) navLoginLink.classList.remove('d-none');
        if (navCadastroLink) navCadastroLink.classList.remove('d-none');

        // Redireciona para login se o usuário tentar acessar uma página restrita
        const path = window.location.pathname;
        if (path.endsWith("perfil.html") || path.endsWith("painel.html") || path.endsWith("aprovacao_pendente.html")) {
            window.location.href = "login.html";
        }
    }
});