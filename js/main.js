// js/main.js

const API_URL_BASE = 'https://your-labic-backend-production.up.railway.app'; // Replace with your actual backend URL

let currentPage = 1;
const postsPerPage = 6;
let currentSearchTerm = '';
let currentCategory = 'all';

function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        toggle.checked = isDarkMode;
    }
}

const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    applyTheme(savedTheme === 'dark');
} else {
    applyTheme(userPrefersDark);
}

document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true,
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const isDarkMode = e.target.checked;
            applyTheme(isDarkMode);
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }

    const blogPageContent = document.querySelector('.blog-grid');
    if (blogPageContent) {
        fetchPosts();

        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', handleSearchPosts);
        }

        const filterButtons = document.querySelectorAll('.filter-btn');
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    currentCategory = button.dataset.filter;
                    currentPage = 1; 
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    fetchPosts();
                });
            });
        }
    }
});

async function fetchPosts() {
    const blogContainer = document.querySelector('.blog-grid');
    if (!blogContainer) return;
    
    blogContainer.innerHTML = '<p class="text-center text-gray-500">Carregando artigos...</p>';

    try {
        let apiUrl = `${API_URL_BASE}/api/posts?page=${currentPage}&per_page=${postsPerPage}&search=${currentSearchTerm}`;
        if (currentCategory !== 'all') {
            apiUrl += `&category=${currentCategory}`;
        }
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
        const data = await response.json();
        
        renderPosts(data.posts);
        renderPagination(data.total_pages, data.current_page);
    } catch (error) {
        console.error("Falha ao buscar posts:", error);
        blogContainer.innerHTML = '<p class="text-danger">Não foi possível carregar os posts. Tente novamente mais tarde.</p>';
    }
}

function renderPosts(posts) {
    const featuredPostContainer = document.querySelector('.blog-post.featured');
    const blogGridContainer = document.querySelector('.blog-grid');
    
    if (featuredPostContainer) featuredPostContainer.innerHTML = '';
    if (blogGridContainer) blogGridContainer.innerHTML = '';

    if (!posts || posts.length === 0) {
        if (blogGridContainer) {
            blogGridContainer.innerHTML = '<p class="text-center text-gray-500">Nenhum post encontrado.</p>';
        }
        return;
    }

    const featuredPost = posts[0];
    if (featuredPostContainer && featuredPost) {
        featuredPostContainer.innerHTML = createPostHTML(featuredPost);
        featuredPostContainer.style.display = 'block';
    }

    const recentPosts = posts.slice(1);
    if (blogGridContainer) {
        recentPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            postElement.innerHTML = createPostHTML(post);
            blogGridContainer.appendChild(postElement);
        });
    }

    AOS.refresh();
}

function renderPagination(totalPages, currentPage) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;

    paginationElement.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = `py-2 px-4 rounded-full font-bold mx-1 transition-all duration-300 ${i === currentPage ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;
        button.addEventListener('click', () => {
            currentPage = i;
            fetchPosts();
        });
        paginationElement.appendChild(button);
    }
}

async function handleSearchPosts(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('search-input').value;
    currentSearchTerm = searchTerm;
    currentPage = 1;
    fetchPosts();
}

function createPostHTML(post) {
    const tagsHtml = Array.isArray(post.tags) ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    
    // Removi a tag <img> para não exibir imagens, conforme sua solicitação
    return `
        <div class="post-header">
            <div class="post-meta">
                <span class="post-date">${post.date}</span>
                <span class="post-category">${post.category}</span>
            </div>
            <h3>${post.title}</h3>
        </div>
        <div class="post-content">
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-tags">
                ${tagsHtml}
            </div>
            <a href="javascript:void(0)" class="read-more-btn">Ler mais <i class="fas fa-arrow-right"></i></a>
        </div>
    `;
}