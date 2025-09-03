// js/auth.js

const API_URL_BASE = 'https://your-labic-backend-production.up.railway.app'; // Substitua pelo URL do seu backend real

/**
 * Helper function to fetch data from the API with authentication headers.
 * @param {string} endpoint The API endpoint.
 * @param {object} [options={}] Fetch options.
 * @returns {Promise<Response>} The fetch response object.
 */
async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('labic-token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        console.error('Sessão expirada. Redirecionando para login.');
        localStorage.removeItem('labic-token');
        window.location.href = '/login.html';
    }

    return response;
}

/**
 * Handles the login form submission.
 * @param {Event} e The submit event.
 */
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('login-message');

    if (messageElement) {
        messageElement.textContent = 'Carregando...';
        messageElement.className = 'message info';
    }

    try {
        const response = await fetchWithAuth('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('labic-token', data.token); // Save the token
            if (messageElement) {
                messageElement.textContent = 'Login bem-sucedido! Redirecionando...';
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

/**
 * Handles the registration form submission.
 * @param {Event} e The submit event.
 */
async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('register-message');

    if (messageElement) {
        messageElement.textContent = 'Carregando...';
        messageElement.className = 'message info';
    }

    try {
        const response = await fetchWithAuth('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
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
                messageElement.textContent = data.message || 'Erro ao registrar. O email pode já existir.';
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

/**
 * Handles the password recovery form submission.
 * @param {Event} e The submit event.
 */
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const messageElement = document.getElementById('forgot-password-message');

    if (messageElement) {
        messageElement.textContent = 'Enviando...';
        messageElement.className = 'message info';
    }

    try {
        const response = await fetch(`${API_URL_BASE}/api/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
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

/**
 * Handles the password reset form submission.
 * @param {Event} e The submit event.
 */
async function handleResetPassword(e) {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElement = document.getElementById('reset-password-message');

    if (newPassword !== confirmPassword) {
        if (messageElement) {
            messageElement.textContent = 'As senhas não coincidem!';
            messageElement.className = 'message error';
        }
        return;
    }

    if (!token) {
        if (messageElement) {
            messageElement.textContent = 'Token de redefinição não encontrado na URL.';
            messageElement.className = 'message error';
        }
        return;
    }

    if (messageElement) {
        messageElement.textContent = 'Redefinindo senha...';
        messageElement.className = 'message info';
    }

    try {
        const response = await fetch(`${API_URL_BASE}/api/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, new_password: newPassword }),
        });
        const data = await response.json();

        if (response.ok) {
            if (messageElement) {
                messageElement.textContent = 'Senha redefinida com sucesso! Redirecionando para login...';
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

/**
 * Handles the logout action.
 */
function handleLogout() {
    localStorage.removeItem('labic-token');
    window.location.href = '/login.html';
}

/**
 * Checks if the user is authenticated and redirects if not.
 */
function checkAuthStatus() {
    const token = localStorage.getItem('labic-token');
    const path = window.location.pathname;

    const requiresAuth = path.includes('/painel.html');
    const requiresNoAuth = path.includes('/login.html') || path.includes('/cadastro.html') || path.includes('/forgot-password.html') || path.includes('/reset-password.html');

    if (requiresAuth && !token) {
        window.location.href = '/login.html';
    }
    
    if (requiresNoAuth && token) {
        window.location.href = '/painel.html';
    }
}

// Initial setup and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status on page load
    checkAuthStatus();

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    if (resetPasswordForm) resetPasswordForm.addEventListener('submit', handleResetPassword);

    // Dynamic link to login page
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/login.html';
        });
    }
});