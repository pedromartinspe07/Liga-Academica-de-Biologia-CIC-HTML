// js/perfil.js

import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { app } from "./auth.js"; // Importa a inicialização do Firebase

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Cache de elementos do DOM
const userNameDisplay = document.getElementById('user-name-display');
const userEmailDisplay = document.getElementById('user-email-display');
const userPhotoDisplay = document.getElementById('user-photo-display');
const userSerieDisplay = document.getElementById('user-serie-display');
const userTurmaDisplay = document.getElementById('user-turma-display');
const userRoleDisplay = document.getElementById('user-role-display');
const userIdDisplay = document.getElementById('user-id-display');
const logoutButton = document.getElementById('logout-button');
const uploadPhotoForm = document.getElementById('upload-photo-form');
const photoInput = document.getElementById('photo-input');
const uploadStatusMessage = document.getElementById('upload-status-message');
const painelLink = document.getElementById('painel-link'); // Novo elemento para o link do painel


// Listener de autenticação para carregar dados do usuário
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Usuário logado
        userEmailDisplay.textContent = user.email;
        userIdDisplay.textContent = user.uid;

        // Ocultar a seção de upload se ela não for relevante para o usuário
        if (uploadPhotoForm) {
            uploadPhotoForm.style.display = 'block';
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || 'membro'; // Pega o cargo do usuário ou define como 'membro'

            if (userNameDisplay) userNameDisplay.textContent = userData.name || 'Nome não definido';
            if (userPhotoDisplay) userPhotoDisplay.src = userData.photoURL || user.photoURL || 'assets/images/default-avatar.png';
            if (userSerieDisplay) userSerieDisplay.textContent = userData.serie || 'Não informado';
            if (userTurmaDisplay) userTurmaDisplay.textContent = userData.turma || 'Não informado';
            if (userRoleDisplay) userRoleDisplay.textContent = role;

            // Mostra o link do painel de controle apenas se o cargo for 'editorChefe' ou 'developer'
            if (painelLink && (role === 'editorChefe' || role === 'developer')) {
                painelLink.classList.remove('d-none');
            }

        } else {
            console.log("Documento do usuário não encontrado no Firestore.");
        }
    } else {
        // Usuário não logado, redireciona para a página de login
        window.location.href = 'login.html';
    }
});

// Lidar com o upload de fotos de perfil (se o formulário existir)
uploadPhotoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = photoInput.files[0];
    if (!file) {
        uploadStatusMessage.className = 'alert alert-danger';
        uploadStatusMessage.textContent = 'Por favor, selecione uma imagem para upload.';
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        uploadStatusMessage.className = 'alert alert-danger';
        uploadStatusMessage.textContent = 'Erro de autenticação. Tente fazer login novamente.';
        return;
    }

    const storageRef = ref(storage, `profile_photos/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const progressBar = document.getElementById('upload-progress');
    progressBar.style.display = 'block';

    uploadTask.on('state_changed',
        (snapshot) => {
            // Progresso do upload
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = `${progress}%`;
        },
        (error) => {
            // Lidar com erros
            console.error("Erro no upload: ", error);
            uploadStatusMessage.className = 'alert alert-danger';
            uploadStatusMessage.textContent = `Erro no upload: ${error.message}`;
            progressBar.style.display = 'none';
        },
        async () => {
            // Upload concluído com sucesso
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Atualiza a URL da foto de perfil no Firebase Auth
                await updateProfile(user, { photoURL: downloadURL });

                // Atualiza o documento do usuário no Firestore (opcional, mas recomendado)
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, { photoURL: downloadURL });
                
                uploadStatusMessage.className = 'alert alert-success';
                uploadStatusMessage.textContent = 'Foto de perfil atualizada com sucesso!';
                userPhotoDisplay.src = downloadURL; // Atualiza a imagem na página
                progressBar.style.display = 'none';
                
            } catch (e) {
                console.error("Erro ao atualizar o perfil: ", e);
                uploadStatusMessage.className = 'alert alert-danger';
                uploadStatusMessage.textContent = `Erro ao atualizar o perfil: ${e.message}`;
            }
        }
    );
});

// Lidar com o botão de logout
logoutButton?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error("Erro ao sair da conta: ", error);
    }
});