// Importa as funções necessárias dos SDKs do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider, 
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

// Exporta o 'app' para que outros módulos possam usá-lo
export { app };

// --- Lógica de Cadastro (para cadastro.html) ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const serie = document.getElementById('register-serie').value;
        const turma = document.getElementById('register-turma').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
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
                
                window.location.href = "aprovacao_pendente.html";
            })
            .catch((error) => {
                console.error("Erro no cadastro:", error.message);
                alert("Erro ao cadastrar: " + error.message);
            });
    });
}

// Lógica de Cadastro com Google
const googleSignInButton = document.getElementById('google-signin-button');
if (googleSignInButton) {
    const provider = new GoogleAuthProvider();
    googleSignInButton.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                console.log("Usuário cadastrado com Google:", user);

                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);

                // Se o usuário não existir, cria o documento no Firestore
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
                // Redireciona para a página de aprovação pendente após o primeiro login
                window.location.href = "aprovacao_pendente.html";
            })
            .catch((error) => {
                console.error("Erro no cadastro com Google:", error.message);
                alert("Erro ao cadastrar com Google: " + error.message);
            });
    });
}

// --- Lógica de Login (para login.html) ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Login realizado:", userCredential.user);
                // O onAuthStateChanged vai lidar com o redirecionamento
            })
            .catch((error) => {
                console.error("Erro no login:", error.message);
                alert("Erro ao fazer login: " + error.message);
            });
    });
}

// --- Lógica de Logout (para perfil.html e painel.html) ---
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("Sair da conta realizado com sucesso.");
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Erro ao sair:", error.message);
            alert("Erro ao sair: " + error.message);
        });
    });
}

// --- Monitora o estado da autenticação (para todas as páginas que o usam) ---
onAuthStateChanged(auth, async (user) => {
    const navLoginLink = document.getElementById('nav-login-link');
    const navCadastroLink = document.getElementById('nav-cadastro-link');
    const navPerfilLink = document.getElementById('nav-perfil-link');
    const navPainelLink = document.getElementById('nav-painel-link');

    // Se o usuário está logado
    if (user) {
        // Esconde Login/Cadastro
        if (navLoginLink) navLoginLink.classList.add('d-none');
        if (navCadastroLink) navCadastroLink.classList.add('d-none');
        // Exibe Perfil
        if (navPerfilLink) navPerfilLink.classList.remove('d-none');
        
        // Verifica o cargo do usuário no Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            const authorizedRoles = ['editor', 'editorChefe', 'developer'];

            // Exibe o link do painel se o cargo for autorizado
            if (navPainelLink && authorizedRoles.includes(role)) {
                navPainelLink.classList.remove('d-none');
            }

            // Redireciona com base no cargo do usuário se ele estiver em uma página de login/cadastro
            if (window.location.pathname.endsWith("cadastro.html") || window.location.pathname.endsWith("login.html")) {
                if (role === 'pendente') {
                    window.location.href = "aprovacao_pendente.html";
                } else if (authorizedRoles.includes(role) || role === 'membro') {
                    window.location.href = "perfil.html";
                }
            }

            // Se o usuário está na página de perfil, exibe as informações
            if (window.location.pathname.endsWith("perfil.html")) {
                const userEmailDisplay = document.getElementById('user-email-display');
                const userIdDisplay = document.getElementById('user-id-display');
                const userPhotoDisplay = document.getElementById('user-photo-display');
                const userNameDisplay = document.getElementById('user-name-display');
                const userSerieDisplay = document.getElementById('user-serie-display');
                const userTurmaDisplay = document.getElementById('user-turma-display');
                const userRoleDisplay = document.getElementById('user-role-display');
                
                if (userEmailDisplay) userEmailDisplay.textContent = user.email;
                if (userIdDisplay) userIdDisplay.textContent = user.uid;
                if (userPhotoDisplay) userPhotoDisplay.src = userData.photoURL;
                if (userNameDisplay) userNameDisplay.textContent = userData.name;
                if (userSerieDisplay) userSerieDisplay.textContent = userData.serie;
                if (userTurmaDisplay) userTurmaDisplay.textContent = userData.turma;
                if (userRoleDisplay) userRoleDisplay.textContent = role;
            }

            // Redireciona para o login se tentar acessar o painel sem permissão
            if (window.location.pathname.endsWith("painel.html") && !authorizedRoles.includes(role)) {
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
        // Se o usuário não está logado
        if (navPerfilLink) navPerfilLink.classList.add('d-none');
        if (navPainelLink) navPainelLink.classList.add('d-none');
        if (navLoginLink) navLoginLink.classList.remove('d-none');
        if (navCadastroLink) navCadastroLink.classList.remove('d-none');

        // Redireciona para login se o usuário tentar acessar uma página restrita
        if (window.location.pathname.endsWith("perfil.html") || window.location.pathname.endsWith("painel.html")) {
            window.location.href = "login.html";
        }
    }
});