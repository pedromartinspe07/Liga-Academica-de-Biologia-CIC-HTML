// ====================================================================
// Configuração e Variáveis Globais
// ====================================================================

// URL da sua API no Railway
const API_URL_BASE = 'https://suape-progresso-ou-poluicao-backend-production.up.railway.app';
// Contêineres principais
const pageContentMap = new Map();
const blogGridContainer = document.getElementById('blog-grid');
const mainContentContainer = document.getElementById('main-content');
const featuredPostContainer = document.getElementById('featured-post-container');

// Variáveis de Estado
const appState = {
    currentPage: 1,
    postsPerPage: 6,
    currentSearchTerm: '',
    currentCategory: 'all',
    dataCache: new Map(), // Cache para armazenar dados da API
};

// ====================================================================
// Lógica de Ativação de Tema (Dark/Light Mode)
// ====================================================================

/**
 * Aplica o tema (claro ou escuro) ao corpo do documento.
 * @param {boolean} isDarkMode - `true` para tema escuro, `false` para tema claro.
 */
function applyTheme(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        toggle.checked = isDarkMode;
    }
}

// Inicializa o tema com base na preferência do usuário ou no localStorage
const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme === 'dark' || (!savedTheme && userPrefersDark));

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a biblioteca AOS
    AOS.init({
        duration: 1000,
        once: true,
        disable: window.innerWidth < 768, // Desativa em telas pequenas
    });

    // Adiciona evento de clique para rolagem suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Evento de clique para o botão de alternar tema
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            const isDarkMode = e.target.checked;
            applyTheme(isDarkMode);
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }

    // Gerencia o roteamento inicial e os eventos
    handleInitialRoute();
    setupEventListeners();
});

// ====================================================================
// Roteamento e Navegação de Página (Single Page Application - SPA)
// ====================================================================

/**
 * Gerencia a navegação para diferentes seções da página.
 * @param {string} pageName - O ID da seção a ser exibida.
 */
function navigateTo(pageName) {
    if (mainContentContainer) {
        // Oculta todas as seções
        document.querySelectorAll('.page-section').forEach(section => {
            section.style.display = 'none';
        });

        // Exibe a seção desejada
        const targetSection = document.getElementById(pageName);
        if (targetSection) {
            targetSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            AOS.refresh();
        }
    }
}

/**
 * Lida com o roteamento inicial da página.
 */
function handleInitialRoute() {
    const hash = window.location.hash.substring(1);
    const pageId = hash || 'home'; // Padrão para a página inicial
    navigateTo(pageId);
    
    // Atualiza o estado da página para o blog, se necessário
    if (pageId === 'blog') {
        fetchPosts();
    }
}

/**
 * Adiciona os ouvintes de evento para a navegação.
 */
function setupEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link-dynamic');
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageName = e.target.getAttribute('data-page');
                if (pageName) {
                    navigateTo(pageName);
                    // Atualiza a URL sem recarregar
                    window.history.pushState(null, '', `#${pageName}`);

                    if (pageName === 'blog') {
                        fetchPosts();
                    }
                }
            });
        });
    }

    // Lógica para o botão "Ler mais"
    if (blogGridContainer) {
        blogGridContainer.addEventListener('click', (e) => {
            const readMoreBtn = e.target.closest('.read-more-btn');
            if (readMoreBtn) {
                e.preventDefault();
                const postId = readMoreBtn.dataset.postId;
                if (postId) {
                    navigateToPost(postId);
                }
            }
        });
    }

    // Lógica para o botão de pesquisa
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchPosts);
    }

    // Lógica para os botões de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                appState.currentCategory = button.dataset.filter;
                appState.currentPage = 1;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                fetchPosts();
            });
        });
    }
}

// ====================================================================
// Funções de Gerenciamento de Posts do Blog
// ====================================================================

/**
 * Busca posts da API com base no estado atual.
 */
async function fetchPosts() {
    if (!blogGridContainer) return;

    const { currentPage, postsPerPage, currentSearchTerm, currentCategory } = appState;
    const cacheKey = `posts-${currentPage}-${postsPerPage}-${currentSearchTerm}-${currentCategory}`;

    // Tenta buscar do cache primeiro
    if (appState.dataCache.has(cacheKey)) {
        const { posts, total_pages } = appState.dataCache.get(cacheKey);
        renderPosts(posts);
        renderPagination(total_pages, currentPage);
        return;
    }

    blogGridContainer.innerHTML = '<p class="text-center text-gray-500">Carregando posts...</p>';

    try {
        let apiUrl = `${API_URL_BASE}/api/posts?page=${currentPage}&per_page=${postsPerPage}`;
        if (currentSearchTerm) {
            apiUrl += `&search=${encodeURIComponent(currentSearchTerm)}`;
        }
        if (currentCategory !== 'all') {
            apiUrl += `&category=${currentCategory}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Armazena no cache antes de renderizar
        appState.dataCache.set(cacheKey, data);

        renderPosts(data.posts);
        renderPagination(data.total_pages, data.current_page);

    } catch (error) {
        console.error("Falha ao buscar posts:", error);
        blogGridContainer.innerHTML = '<p class="text-danger">Não foi possível carregar os posts. Tente novamente mais tarde.</p>';
    }
}

/**
 * Renderiza a lista de posts na página.
 * @param {Array<Object>} posts - Array de objetos de posts.
 */
function renderPosts(posts) {
    // Esconde o post em destaque se não houver posts
    featuredPostContainer.style.display = 'none';
    blogGridContainer.innerHTML = '';

    if (!posts || posts.length === 0) {
        blogGridContainer.innerHTML = '<p class="text-center text-gray-500">Nenhum post encontrado.</p>';
        return;
    }

    // Renderiza o primeiro post como destaque se estiver na primeira página e não houver termo de busca
    if (appState.currentPage === 1 && !appState.currentSearchTerm && featuredPostContainer) {
        const featuredPost = posts[0];
        featuredPostContainer.innerHTML = createPostHTML(featuredPost, true);
        featuredPostContainer.style.display = 'block';
        
        const recentPosts = posts.slice(1);
        recentPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            postElement.innerHTML = createPostHTML(post);
            blogGridContainer.appendChild(postElement);
        });
    } else {
        // Renderiza todos os posts na grade se houver pesquisa ou não for a primeira página
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'blog-post';
            postElement.innerHTML = createPostHTML(post);
            blogGridContainer.appendChild(postElement);
        });
    }

    AOS.refresh();
}

/**
 * Renderiza os botões de paginação.
 * @param {number} totalPages - Número total de páginas.
 * @param {number} currentPage - A página atual.
 */
function renderPagination(totalPages, currentPage) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;

    paginationElement.innerHTML = '';
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        appendPaginationButton(paginationElement, 1, 'Primeira');
        if (startPage > 2) {
            paginationElement.innerHTML += '<span class="text-gray-500 mx-1">...</span>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        appendPaginationButton(paginationElement, i, i, i === currentPage);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationElement.innerHTML += '<span class="text-gray-500 mx-1">...</span>';
        }
        appendPaginationButton(paginationElement, totalPages, 'Última');
    }
}

/**
 * Cria e adiciona um botão de paginação.
 * @param {HTMLElement} container - O contêiner onde o botão será adicionado.
 * @param {number} page - O número da página.
 * @param {string} text - O texto do botão.
 * @param {boolean} [isActive=false] - Se o botão está ativo.
 */
function appendPaginationButton(container, page, text, isActive = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `py-2 px-4 rounded-full font-bold mx-1 transition-all duration-300 ${isActive ? 'bg-primary-color text-light-text-color' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;
    button.addEventListener('click', () => {
        appState.currentPage = page;
        fetchPosts();
    });
    container.appendChild(button);
}


/**
 * Lida com o evento de busca de posts.
 * @param {Event} e - O evento de envio do formulário.
 */
async function handleSearchPosts(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm !== appState.currentSearchTerm) {
        appState.currentSearchTerm = searchTerm;
        appState.currentPage = 1;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        fetchPosts();
    }
}

/**
 * Constrói o HTML para um post individual.
 * @param {Object} post - Objeto com os dados do post.
 * @param {boolean} [isFeatured=false] - Se o post é o destaque.
 * @returns {string} O HTML gerado.
 */
function createPostHTML(post, isFeatured = false) {
    const tagsHtml = Array.isArray(post.tags) ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    const postClass = isFeatured ? 'blog-post featured' : 'blog-post';

    return `
        <div class="${postClass}">
            <div class="post-header">
                <div class="post-meta">
                    <span class="post-date">${formatDate(post.date)}</span>
                    <span class="post-category">${post.category}</span>
                    <span class="post-read-time">${post.readTime} min de leitura</span>
                </div>
                <h3>${post.title}</h3>
            </div>
            <div class="post-content">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image">` : ''}
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${tagsHtml}
                </div>
                <a href="#post-${post.id}" class="read-more-btn" data-post-id="${post.id}">Ler mais <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `;
}

/**
 * Navega para uma página de post individual.
 * @param {string} postId - O ID do post.
 */
async function navigateToPost(postId) {
    const post = await fetchPostById(postId);
    if (post) {
        renderFullPostPage(post);
        window.history.pushState(null, '', `#post-${postId}`);
    } else {
        console.error('Post não encontrado.');
    }
}

/**
 * Renderiza uma página de post completa.
 * @param {Object} post - Objeto do post a ser renderizado.
 */
function renderFullPostPage(post) {
    const fullPostContent = `
        <section class="container my-5">
            <h1 class="text-center">${post.title}</h1>
            <div class="post-meta text-center mb-4">
                <span class="text-muted">${formatDate(post.date)}</span>
                <span class="mx-2">|</span>
                <span class="badge bg-primary-color">${post.category}</span>
            </div>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="img-fluid rounded mb-4">` : ''}
            <div class="post-body">
                ${post.content}
            </div>
            <a href="#blog" class="btn btn-primary mt-4">Voltar para o Blog</a>
        </section>
    `;
    mainContentContainer.innerHTML = fullPostContent;
    navigateTo('post-detail-page');
}

/**
 * Busca um único post por ID.
 * @param {string} postId - O ID do post.
 * @returns {Promise<Object|null>} O objeto do post ou null em caso de erro.
 */
async function fetchPostById(postId) {
    const cacheKey = `post-${postId}`;
    if (appState.dataCache.has(cacheKey)) {
        return appState.dataCache.get(cacheKey);
    }
    try {
        const response = await fetch(`${API_URL_BASE}/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Falha ao buscar o post.');
        }
        const post = await response.json();
        appState.dataCache.set(cacheKey, post);
        return post;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// ====================================================================
// Funções Utilitárias
// ====================================================================

/**
 * Formata uma string de data para um formato mais legível.
 * @param {string} dateString - A data em formato de string.
 * @returns {string} A data formatada.
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}