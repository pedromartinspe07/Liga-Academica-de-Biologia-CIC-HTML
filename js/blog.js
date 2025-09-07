// js/blog.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const POSTS_COLLECTION_PATH = "posts";

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

if (Object.values(firebaseConfig).some(val => val.includes("YOUR_"))) {
    console.error("Firebase não inicializado. Por favor, forneça sua configuração em firebaseConfig.");
    document.getElementById('initial-loading').innerHTML = '<p class="text-danger">Erro de configuração do Firebase. Por favor, verifique o código-fonte.</p>';
} else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            await signInAnonymously(auth);
        }
        fetchBlogPosts();
    });
}

const allPostsContainer = document.getElementById('all-posts');
const addPostForm = document.getElementById('add-post-form');
const filterButtons = document.querySelectorAll('[data-filter]');

function renderPost(post) {
    const date = post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data Indisponível';
    
    return `
        <div class="col" data-category="${post.category}" data-aos="fade-up">
            <div class="card h-100 shadow-sm blog-post-card">
                <img src="${post.imageUrl || 'https://placehold.co/600x400/f0f0f0/909090?text=Imagem+LABIC'}" class="card-img-top blog-post-image" alt="${post.title}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/f0f0f0/909090?text=Imagem+Nao+Encontrada';">
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

function fetchBlogPosts() {
    if (!db) return;
    
    const postsCollection = collection(db, POSTS_COLLECTION_PATH);
    const q = query(postsCollection, orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        const postsHTML = [];
        snapshot.forEach((doc) => {
            postsHTML.push(renderPost(doc.data()));
        });
        
        allPostsContainer.innerHTML = postsHTML.length > 0 ? postsHTML.join('') : '<p class="text-center w-100">Nenhuma postagem encontrada. Seja o primeiro a adicionar!</p>';
        AOS.refresh();
    }, (error) => {
        console.error("Erro ao carregar as postagens:", error);
        document.getElementById('initial-loading').innerHTML = '<p class="text-danger w-100">Erro ao carregar as postagens. Tente novamente mais tarde.</p>';
    });
}

addPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!db) return;

    const newPost = {
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        imageUrl: document.getElementById('postImage').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, POSTS_COLLECTION_PATH), newPost);
        document.getElementById('message-container').innerHTML = '<div class="alert alert-success" role="alert">Postagem adicionada com sucesso!</div>';
        addPostForm.reset();
    } catch (e) {
        console.error("Erro ao adicionar documento: ", e);
        document.getElementById('message-container').innerHTML = '<div class="alert alert-danger" role="alert">Erro ao adicionar a postagem. Tente novamente.</div>';
    }
});

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

document.addEventListener('DOMContentLoaded', () => {
    AOS.init();
});