import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { app } from "./auth.js"; // Importa a inicialização do Firebase

const db = getFirestore(app);

// Adicionar um novo post no blog
const addBlogPostForm = document.getElementById('add-blog-post-form');
if (addBlogPostForm) {
    addBlogPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Coleta os valores do formulário
        const title = document.getElementById('post-title').value;
        const category = document.getElementById('post-category').value;
        const imageUrl = document.getElementById('post-image-url').value;
        const excerpt = document.getElementById('post-excerpt').value;
        const content = document.getElementById('post-content').value;
        const statusMessage = document.getElementById('status-message');

        try {
            // Adiciona o novo documento na coleção 'blog_posts' com os novos campos
            const docRef = await addDoc(collection(db, "blog_posts"), {
                title: title,
                category: category,
                imageUrl: imageUrl,
                excerpt: excerpt,
                content: content,
                createdAt: serverTimestamp(), // Usa o timestamp do servidor para maior precisão
                status: 'published'
            });
            
            statusMessage.className = 'alert alert-success';
            statusMessage.textContent = "Post adicionado com sucesso! ID: " + docRef.id;
            addBlogPostForm.reset(); // Limpa o formulário
            console.log("Documento escrito com ID: ", docRef.id);
        } catch (e) {
            statusMessage.className = 'alert alert-danger';
            statusMessage.textContent = "Erro ao adicionar o post: " + e.message;
            console.error("Erro ao adicionar o documento: ", e);
        }
    });
}