// js/blog.js

import { app } from "./auth.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Mapeia o caminho da sua coleção de dados no Firestore
const POSTS_COLLECTION_PATH = "posts";

// Inicializa os serviços do Firebase a partir da instância importada
const auth = getAuth(app);
const db = getFirestore(app);

// Cache de elementos DOM para evitar buscas repetidas
const allPostsContainer = document.getElementById('all-posts');
const filterButtons = document.querySelectorAll('[data-filter]');
const initialLoading = document.getElementById('initial-loading');

/**
 * Renderiza um único card de postagem.
 * @param {object} post - O objeto de postagem do Firestore.
 * @returns {string} O HTML do card.
 */
function renderPost(post) {
    // Formata a data de forma segura, verificando se o campo existe
    const date = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data Indisponível';
    
    // Usa uma imagem de fallback segura caso a URL não esteja presente ou seja inválida
    const imageUrl = post.imageUrl && post.imageUrl.startsWith('http') ? post.imageUrl : 'https://placehold.co/600x400/f0f0f0/909090?text=Imagem+LABIC';
    const category = post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : 'Geral';

    return `
        <div class="col" data-category="${post.category || 'geral'}" data-aos="fade-up">
            <div class="card h-100 shadow-sm blog-post-card">
                <img src="${imageUrl}" class="card-img-top blog-post-image" alt="${post.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/909090?text=Imagem+Nao+Encontrada';">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-primary mb-2" style="width: fit-content;">${category}</span>
                    <h5 class="card-title fw-bold">${post.title}</h5>
                    <p class="card-text">${post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'Sem conteúdo disponível.')}</p>
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
 * Busca e exibe os posts do Firestore em tempo real.
 */
function fetchBlogPosts() {
    // Esconde a mensagem de carregamento inicial
    if (initialLoading) {
        initialLoading.style.display = 'none';
    }
    
    const postsCollection = collection(db, POSTS_COLLECTION_PATH);
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    
    // onSnapshot cria uma conexão em tempo real.
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
        allPostsContainer.innerHTML = '<p class="text-danger text-center w-100">Erro ao carregar as postagens. Tente novamente mais tarde.</p>';
    });
}

// Lógica de Autenticação e Carregamento
// Autentica o usuário anonimamente para permitir a leitura das postagens
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Se não houver usuário logado, tenta o login anônimo
        await signInAnonymously(auth);
    }
    // Uma vez autenticado (ou se já estiver), busca os posts
    fetchBlogPosts();
});

// Adiciona event listeners aos botões de filtro
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
        AOS.refreshHard(); // Garante que as animações sejam re-calculadas
    });
});