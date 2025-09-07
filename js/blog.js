// js/blog.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mapeia o caminho da sua coleção de dados no Firestore
const POSTS_COLLECTION_PATH = "posts";

// 1. Configure seu Firebase aqui
// Substitua "YOUR_..." pela sua configuração real do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDaAawNtQVo1ovIPGyN_LlTeR5KquZDfJ8",
    authDomain: "labic-html.firebaseapp.com",
    projectId: "labic-html",
    storageBucket: "labic-html.firebasestorage.app",
    messagingSenderId: "283475569681",
    appId: "1:283475569681:web:4108a0c6fe9621972e55b0"
};

let app;
let db;
let auth;

// Melhoria: Inicializa o Firebase de forma mais robusta com tratamento de erros.
// Isso resolve o erro 'auth/configuration-not-found' de forma mais segura.
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
const addPostForm = document.getElementById('add-post-form');
const filterButtons = document.querySelectorAll('[data-filter]');
const messageContainer = document.getElementById('message-container');
const initialLoading = document.getElementById('initial-loading');

/**
 * Renderiza um único card de postagem.
 * @param {object} post - O objeto de postagem do Firestore.
 * @returns {string} O HTML do card.
 */
function renderPost(post) {
    const date = post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data Indisponível';
    
    // Melhoria: Usando uma imagem de fallback mais genérica e segura.
    const imageUrl = post.imageUrl && post.imageUrl.startsWith('http') ? post.imageUrl : 'https://placehold.co/600x400/f0f0f0/909090?text=Imagem+LABIC';

    return `
        <div class="col" data-category="${post.category}" data-aos="fade-up">
            <div class="card h-100 shadow-sm blog-post-card">
                <img src="${imageUrl}" class="card-img-top blog-post-image" alt="${post.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/909090?text=Imagem+Nao+Encontrada';">
                <div class="card-body">
                    <span class="badge bg-primary mb-2">${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</span>
                    <h5 class="card-title fw-bold">${post.title}</h5>
                    <p class="card-text">${post.excerpt}</p>
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
    const q = query(postsCollection, orderBy("timestamp", "desc"));
    
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

// Lidar com o envio do formulário para adicionar um novo post
addPostForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!db) {
        messageContainer.innerHTML = '<div class="alert alert-danger" role="alert">O banco de dados não está disponível.</div>';
        return;
    }

    const formElements = e.target.elements;
    const newPost = {
        title: formElements.postTitle.value,
        category: formElements.postCategory.value,
        imageUrl: formElements.postImage.value,
        excerpt: formElements.postExcerpt.value,
        content: formElements.postContent.value,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, POSTS_COLLECTION_PATH), newPost);
        messageContainer.innerHTML = '<div class="alert alert-success" role="alert">Postagem adicionada com sucesso!</div>';
        addPostForm.reset();
    } catch (error) {
        console.error("Erro ao adicionar documento: ", error);
        messageContainer.innerHTML = '<div class="alert alert-danger" role="alert">Erro ao adicionar a postagem. Tente novamente.</div>';
    }
});

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

// Inicializa a biblioteca AOS para animações ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    AOS.init();
});