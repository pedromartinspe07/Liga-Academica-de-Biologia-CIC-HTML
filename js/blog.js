// js/blog.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Mapeia o caminho da sua coleção de dados no Firestore
// Usamos "blog_posts" conforme o painel de controle criado
const POSTS_COLLECTION_PATH = "blog_posts";

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

let app;
let db;
let auth;

// Melhoria: Inicializa o Firebase de forma mais robusta com tratamento de erros.
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Autentica o usuário anonimamente e carrega os posts após a autenticação
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            await signInAnonymously(auth);
        }
        fetchBlogPosts();
    });
} catch (error) {
    console.error("Erro ao inicializar o Firebase:", error);
    // Exibe uma mensagem de erro na interface do usuário
    document.getElementById('initial-loading').innerHTML = '<p class="text-danger">Erro de inicialização do Firebase. Verifique a configuração e as regras de segurança.</p>';
}

// Otimização: Cache de elementos DOM para evitar buscas repetidas.
const allPostsContainer = document.getElementById('all-posts');
const filterButtons = document.querySelectorAll('[data-filter]');
const initialLoading = document.getElementById('initial-loading');

/**
 * Renderiza um único card de postagem.
 * @param {object} post - O objeto de postagem do Firestore.
 * @returns {string} O HTML do card.
 */
function renderPost(post) {
    const date = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data Indisponível';
    
    // Melhoria: Usando uma imagem de fallback mais genérica e segura.
    const imageUrl = post.imageUrl && post.imageUrl.startsWith('http') ? post.imageUrl : 'https://placehold.co/600x400/f0f0f0/909090?text=Imagem+LABIC';
    const category = post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : 'Geral';

    return `
        <div class="col" data-category="${post.category || 'geral'}" data-aos="fade-up">
            <div class="card h-100 shadow-sm blog-post-card">
                <img src="${imageUrl}" class="card-img-top blog-post-image" alt="${post.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/909090?text=Imagem+Nao+Encontrada';">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-primary mb-2" style="width: fit-content;">${category}</span>
                    <h5 class="card-title fw-bold">${post.title}</h5>
                    <p class="card-text">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
                    <a href="#" class="btn btn-outline-primary mt-auto">Ler mais <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                </div>
                <div class="card-footer text-muted">
                    <small class="text-body-secondary">Publicado em ${date}</small>
                </div>
            </div>
        </div>
    `;
}

/**
 * Busca e exibe os posts do Firestore.
 */
function fetchBlogPosts() {
    if (!db) return;
    
    const postsCollection = collection(db, POSTS_COLLECTION_PATH);
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    
    // Otimização: Acompanha as mudanças na coleção em tempo real.
    onSnapshot(q, (snapshot) => {
        const postsHTML = [];
        if (snapshot.empty) {
            allPostsContainer.innerHTML = '<p class="text-center w-100">Nenhuma postagem encontrada. Seja o primeiro a adicionar!</p>';
        } else {
            snapshot.forEach((doc) => {
                postsHTML.push(renderPost(doc.data()));
            });
            allPostsContainer.innerHTML = postsHTML.join('');
        }
        AOS.refresh();
    }, (error) => {
        console.error("Erro ao carregar as postagens:", error);
        initialLoading.innerHTML = '<p class="text-danger w-100">Erro ao carregar as postagens. Tente novamente mais tarde.</p>';
    });
}

// Funcionalidade de filtro
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-secondary');
        });
        button.classList.remove('btn-secondary');
        button.classList.add('active', 'btn-primary');
        
        const filter = button.dataset.filter;
        const posts = document.querySelectorAll('#all-posts .col');
        
        posts.forEach(post => {
            const postCategory = post.dataset.category;
            if (filter === 'all' || postCategory === filter) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
        AOS.refreshHard();
    });
});