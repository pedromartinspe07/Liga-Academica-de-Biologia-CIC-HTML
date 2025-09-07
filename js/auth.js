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
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Sua configuração do app Firebase (você pode manter ou mover para um arquivo separado)
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

// --- Lógica de Cadastro (para cadastro.html) ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log("Usuário cadastrado com e-mail:", user);
                
                // Cria um documento no Firestore com o papel 'membro'
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    role: "membro"
                });
                
                window.location.href = "perfil.html";
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

                // Cria um documento no Firestore com o papel 'membro'
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    role: "membro"
                });

                window.location.href = "perfil.html";
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
                window.location.href = "perfil.html";
            })
            .catch((error) => {
                console.error("Erro no login:", error.message);
                alert("Erro ao fazer login: " + error.message);
            });
    });
}

// --- Lógica de Logout (para perfil.html) ---
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
onAuthStateChanged(auth, (user) => {
    // Se o usuário não estiver logado e a página for a de perfil, redireciona para login
    if (!user && window.location.pathname.endsWith("perfil.html")) {
        window.location.href = "login.html";
    }

    // Se o usuário estiver logado e a página for a de perfil, exibe as informações
    if (user && window.location.pathname.endsWith("perfil.html")) {
        const userEmailDisplay = document.getElementById('user-email-display');
        const userIdDisplay = document.getElementById('user-id-display');
        if (userEmailDisplay) userEmailDisplay.textContent = user.email;
        if (userIdDisplay) userIdDisplay.textContent = user.uid;
    }
});