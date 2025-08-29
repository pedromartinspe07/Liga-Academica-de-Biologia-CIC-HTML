// js/auth.js

const API_URL_BASE = 'https://your-labic-backend-production.up.railway.app'; // Replace with your actual backend URL

document.addEventListener('DOMContentLoaded', () => {
    // Existing authentication forms and buttons
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');

    // New elements for password recovery and reset
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const loginBtn = document.getElementById('login-btn');

    // Event listeners
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    if (resetPasswordForm) resetPasswordForm.addEventListener('submit', handleResetPassword);
    if (loginBtn) loginBtn.addEventListener('click', () => { window.location.href = '/login.html'; });
});

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('login-message');
    
    // Clear previous messages
    if (messageElement) messageElement.textContent = '';

    try {
        const response = await fetch(`${API_URL_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            if (messageElement) {
                messageElement.textContent = 'Login bem-sucedido! Redirecionando para o painel...';
                messageElement.className = 'message success';
            }
            window.location.href = '/painel.html';
        } else {
            if (messageElement) {
                messageElement.textContent = data.message || 'Credenciais inválidas.';
                messageElement.className = 'message error';
            }
        }
    } catch (error) {
        if (messageElement) {
            messageElement.textContent = 'Erro na conexão com o servidor. Tente novamente mais tarde.';
            messageElement.className = 'message error';
        }
        console.error('Login Error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('register-message');
    
    if (messageElement) messageElement.textContent = '';

    try {
        const response = await fetch(`${API_URL_BASE}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.status === 201) {
            if (messageElement) {
                messageElement.textContent = 'Cadastro bem-sucedido! Redirecionando para login...';
                messageElement.className = 'message success';
            }
            setTimeout(() => { window.location.href = '/login.html'; }, 2000);
        } else {
            if (messageElement) {
                messageElement.textContent = data.message || 'Erro ao registrar. O nome de usuário pode já existir.';
                messageElement.className = 'message error';
            }
        }
    } catch (error) {
        if (messageElement) {
            messageElement.textContent = 'Erro na conexão com o servidor.';
            messageElement.className = 'message error';
        }
        console.error('Register Error:', error);
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_URL_BASE}/api/logout`, { method: 'POST' });
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            console.error('Logout failed.');
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const username = document.getElementById('forgot-username').value;
    const messageElement = document.getElementById('forgot-password-message');
    
    if (messageElement) messageElement.textContent = '';

    try {
        const response = await fetch(`${API_URL_BASE}/api/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await response.json();

        if (response.ok) {
            if (messageElement) {
                messageElement.textContent = 'Se o usuário existir, um link de redefinição de senha será enviado.';
                messageElement.className = 'message success';
            }
        } else {
            if (messageElement) {
                messageElement.textContent = data.message || 'Erro ao solicitar a redefinição de senha.';
                messageElement.className = 'message error';
            }
        }
    } catch (error) {
        if (messageElement) {
            messageElement.textContent = 'Erro na conexão com o servidor.';
            messageElement.className = 'message error';
        }
        console.error('Forgot Password Error:', error);
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElement = document.getElementById('reset-password-message');
    
    if (messageElement) messageElement.textContent = '';

    if (newPassword !== confirmPassword) {
        if (messageElement) {
            messageElement.textContent = 'As senhas não coincidem!';
            messageElement.className = 'message error';
        }
        return;
    }

    try {
        const response = await fetch(`${API_URL_BASE}/api/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password: newPassword })
        });
        const data = await response.json();

        if (response.ok) {
            if (messageElement) {
                messageElement.textContent = 'Senha redefinida com sucesso!';
                messageElement.className = 'message success';
            }
            setTimeout(() => { window.location.href = '/login.html'; }, 3000);
        } else {
            if (messageElement) {
                messageElement.textContent = data.message || 'O token é inválido ou expirou.';
                messageElement.className = 'message error';
            }
        }
    } catch (error) {
        if (messageElement) {
            messageElement.textContent = 'Erro na conexão com o servidor.';
            messageElement.className = 'message error';
        }
        console.error('Reset Password Error:', error);
    }
}