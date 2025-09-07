// js/perfil.js

import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
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
const progressBar = document.querySelector('.progress');

// Verifica o estado da autenticação do usuário
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Usuário logado
        userNameDisplay.textContent = user.displayName || 'Usuário sem nome';
        userEmailDisplay.textContent = user.email || 'E-mail não disponível';
        userPhotoDisplay.src = user.photoURL || 'assets/images/default-avatar.png';
        userIdDisplay.textContent = user.uid;

        // Busca dados adicionais do Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userSerieDisplay.textContent = userData.serie || 'Não informado';
            userTurmaDisplay.textContent = userData.turma || 'Não informado';
            userRoleDisplay.textContent = userData.role || 'Não informado';
        } else {
            console.log("Documento do usuário não encontrado no Firestore!");
        }

    } else {
        // Usuário não logado, redireciona para a página de login
        window.location.href = 'login.html';
    }
});

// Lida com o upload da foto de perfil
uploadPhotoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        uploadStatusMessage.className = 'alert alert-danger';
        uploadStatusMessage.textContent = 'Nenhum usuário logado.';
        return;
    }

    const file = photoInput.files[0];
    if (!file) {
        uploadStatusMessage.className = 'alert alert-warning';
        uploadStatusMessage.textContent = 'Nenhuma foto selecionada.';
        return;
    }

    // Cria uma referência para o arquivo no Firebase Storage
    // O nome do arquivo será o UID do usuário para garantir unicidade
    const storageRef = ref(storage, `profile_pictures/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Exibe a barra de progresso
    progressBar.style.display = 'block';

    // Monitora o progresso do upload
    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const progressBarElement = progressBar.querySelector('.progress-bar');
            progressBarElement.style.width = progress + '%';
            progressBarElement.setAttribute('aria-valuenow', progress);
            uploadStatusMessage.className = 'alert alert-info';
            uploadStatusMessage.textContent = `Upload em andamento... ${Math.round(progress)}%`;
        }, 
        (error) => {
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