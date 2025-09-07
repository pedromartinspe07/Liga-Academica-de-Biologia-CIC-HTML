// js/perfil.js

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Inicialize o Firestore
const auth = getAuth();
const db = getFirestore();

// Obtém o elemento onde o papel do usuário será exibido
const userRoleDisplay = document.getElementById('user-role-display');

// Adicione a lógica de permissões aqui
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // O usuário está logado.
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userRole = userData.role;

            // Exibe o papel do usuário no elemento HTML
            userRoleDisplay.textContent = `Cargo: ${userRole}`;

            // Lógica para mostrar/esconder elementos com base no papel
            if (userRole === "editor" || userRole === "editor_chefe" || userRole === "desenvolvedor") {
                // Exemplo: mostrar um botão de "Editar Blog"
                document.getElementById('edit-blog-button').style.display = 'block';
            }

            if (userRole === "editor_chefe" || userRole === "desenvolvedor") {
                // Exemplo: mostrar um botão de "Revisar Posts"
                document.getElementById('review-posts-button').style.display = 'block';
            }

            if (userRole === "desenvolvedor") {
                // Exemplo: mostrar o painel de "Administração do Site"
                document.getElementById('admin-panel').style.display = 'block';
            }
        } else {
            console.log("Documento do usuário não encontrado no Firestore.");
        }
    } else {
        // O usuário não está logado
        console.log("Nenhum usuário logado.");
    }
});