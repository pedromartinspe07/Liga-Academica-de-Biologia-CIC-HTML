// painel.js

import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, updateDoc, doc, getDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { app, auth } from "./auth.js"; // Importa as instâncias de app e auth do auth.js

const db = getFirestore(app);

// Adicionar um novo post no blog
const addBlogPostForm = document.getElementById('add-blog-post-form');

// Funções para gerenciar o estado da interface
function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
        statusMessage.className = `alert alert-${type}`;
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
    }
}

function hideStatusMessage() {
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
        statusMessage.style.display = 'none';
    }
}

function setupAuthorPanel() {
    const painelContent = document.getElementById('painel-content');
    if (painelContent) {
        painelContent.innerHTML = `
            <div class="col-md-8 mx-auto">
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">Adicionar Novo Post</h5>
                        <form id="add-blog-post-form">
                            <div class="mb-3">
                                <label for="post-title" class="form-label">Título do Post</label>
                                <input type="text" class="form-control" id="post-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="post-category" class="form-label">Categoria</label>
                                <select class="form-select" id="post-category" required>
                                    <option value="" disabled selected>Selecione uma categoria</option>
                                    <option value="noticias">Notícias</option>
                                    <option value="artigos">Artigos</option>
                                    <option value="eventos">Eventos</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="post-image-url" class="form-label">URL da Imagem</label>
                                <input type="url" class="form-control" id="post-image-url" required>
                            </div>
                            <div class="mb-3">
                                <label for="post-excerpt" class="form-label">Resumo (opcional)</label>
                                <textarea class="form-control" id="post-excerpt" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="post-content" class="form-label">Conteúdo Completo (Markdown)</label>
                                <textarea class="form-control" id="post-content" rows="10" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Adicionar Post</button>
                        </form>
                    </div>
                </div>
                <div id="status-message" class="alert mt-3 d-none"></div>
            </div>
        `;
        setupAddPostForm();
    }
}

function setupDeveloperPanel() {
    const painelContent = document.getElementById('painel-content');
    if (painelContent) {
        painelContent.innerHTML = `
            <div class="col-md-8 mx-auto">
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">Gerenciamento de Usuários</h5>
                        <div id="user-list">
                            <p>Carregando usuários...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        setupUserManagement();
    }
}

function setupAddPostForm() {
    const form = document.getElementById('add-blog-post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            showStatusMessage("Adicionando post...", "info");
            
            const title = document.getElementById('post-title').value;
            const category = document.getElementById('post-category').value;
            const imageUrl = document.getElementById('post-image-url').value;
            const excerpt = document.getElementById('post-excerpt').value;
            const content = document.getElementById('post-content').value;

            try {
                const docRef = await addDoc(collection(db, "posts"), {
                    title: title,
                    category: category,
                    imageUrl: imageUrl,
                    excerpt: excerpt,
                    content: content,
                    createdAt: serverTimestamp(),
                    status: 'published'
                });
                
                showStatusMessage("Post adicionado com sucesso!", "success");
                form.reset();
                console.log("Documento escrito com ID: ", docRef.id);
            } catch (e) {
                showStatusMessage("Erro ao adicionar o post: " + e.message, "danger");
                console.error("Erro ao adicionar o documento: ", e);
            }
        });
    }
}

function setupUserManagement() {
    const userListContainer = document.getElementById('user-list');
    if (userListContainer) {
        const q = query(collection(db, "users"), orderBy("name"));
        
        onSnapshot(q, (snapshot) => {
            let usersHtml = '';
            snapshot.forEach((doc) => {
                const userData = doc.data();
                usersHtml += `
                    <div class="mb-3 p-3 border rounded">
                        <p><strong>Nome:</strong> ${userData.name}</p>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Cargo Atual:</strong> <span id="role-${doc.id}">${userData.role}</span></p>
                        <select id="select-role-${doc.id}" class="form-select w-50 d-inline-block">
                            <option value="membro" ${userData.role === 'membro' ? 'selected' : ''}>Membro</option>
                            <option value="editor" ${userData.role === 'editor' ? 'selected' : ''}>Editor</option>
                            <option value="editorChefe" ${userData.role === 'editorChefe' ? 'selected' : ''}>Editor Chefe</option>
                            <option value="developer" ${userData.role === 'developer' ? 'selected' : ''}>Developer</option>
                            <option value="pendente" ${userData.role === 'pendente' ? 'selected' : ''}>Pendente</option>
                        </select>
                        <button class="btn btn-success btn-sm ms-2 update-role-btn" data-user-id="${doc.id}">Atualizar Cargo</button>
                    </div>
                `;
            });
            userListContainer.innerHTML = usersHtml;
            setupUpdateRoleListeners();
        }, (error) => {
            console.error("Erro ao carregar lista de usuários: ", error);
            userListContainer.innerHTML = `<p class="alert alert-danger">Erro ao carregar a lista de usuários.</p>`;
        });
    }
}

function setupUpdateRoleListeners() {
    document.querySelectorAll('.update-role-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.dataset.userId;
            const newRole = document.getElementById(`select-role-${userId}`).value;
            const userRef = doc(db, "users", userId);
            
            try {
                await updateDoc(userRef, { role: newRole });
                alert("Cargo atualizado com sucesso!");
            } catch (e) {
                console.error("Erro ao atualizar o cargo:", e);
                alert("Erro ao atualizar o cargo: " + e.message);
            }
        });
    });
}

// Lógica principal: Verifica o cargo do usuário e carrega o painel correto
auth.onAuthStateChanged(async (user) => {
    const painelContent = document.getElementById('painel-content');
    const loadingMessage = document.getElementById('loading-message');

    if (loadingMessage) loadingMessage.style.display = 'block';

    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || 'pending';
            
            if (loadingMessage) loadingMessage.style.display = 'none';

            if (role === 'editorChefe' || role === 'developer') {
                setupDeveloperPanel();
                setupAuthorPanel(); 
            } else if (role === 'editor') {
                setupAuthorPanel();
            } else {
                painelContent.innerHTML = `<div class="col-12 text-center"><p class="alert alert-danger">Acesso negado. Você não tem permissão para acessar este painel.</p></div>`;
            }
        } else {
            painelContent.innerHTML = `<div class="col-12 text-center"><p class="alert alert-danger">Dados do usuário não encontrados.</p></div>`;
        }
    } else {
        window.location.href = "login.html";
    }
});