// ====================================================================
// Gerenciamento de Modelo 3D
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {

    const model3dModal = document.getElementById('model3dModal');
    if (!model3dModal) {
        console.error("Modal 3D não encontrado.");
        return;
    }

    // Variáveis de escopo global para o módulo
    let scene, camera, renderer, controls, model;
    let isModelLoaded = false;
    const container = document.getElementById('model-container');

    /**
     * Inicializa a cena, câmera, luzes e o renderizador do Three.js.
     * Esta função é chamada apenas uma vez.
     */
    function initThree() {
        if (renderer) return; // Evita inicialização múltipla

        // Cena e Fundo
        scene = new THREE.Scene();
        scene.background = new THREE.Color(getBackgroundColor());

        // Câmera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(2, 2, 4);

        // Renderizador
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Luzes
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        // Controles de Órbita
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        animate();
    }

    /**
     * Determina a cor de fundo da cena com base no tema atual.
     * @returns {number} Cor de fundo em hexadecimal.
     */
    function getBackgroundColor() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        return isDarkMode ? 0x2c313a : 0xf0f0f0;
    }

    /**
     * Carrega o modelo 3D usando o GLTFLoader.
     * @param {string} modelPath - O caminho para o arquivo GLB.
     */
    function loadModel(modelPath) {
        showLoadingState();

        const loader = new THREE.GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                model = gltf.scene;
                scene.add(model);
                isModelLoaded = true;
                hideLoadingState();
                console.log('Modelo 3D carregado com sucesso!');
            },
            // Função de progresso do carregamento
            (xhr) => {
                const progress = (xhr.loaded / xhr.total) * 100;
                updateLoadingProgress(progress);
            },
            // Função de erro do carregamento
            (error) => {
                console.error('Um erro ocorreu ao carregar o modelo 3D:', error);
                showErrorState('Não foi possível carregar o modelo. Tente novamente mais tarde.');
            }
        );
    }

    /**
     * Loop de animação para renderizar a cena.
     */
    function animate() {
        requestAnimationFrame(animate);
        if (controls) {
            controls.update();
        }
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    /**
     * Função para redimensionar a cena e o renderizador.
     */
    function onWindowResize() {
        if (renderer && camera) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }

    // Gerenciamento do Modal e Eventos
    model3dModal.addEventListener('shown.bs.modal', () => {
        // Inicializa o Three.js e carrega o modelo apenas na primeira vez que o modal é aberto
        if (!renderer) {
            initThree();
            // Caminho para o seu modelo GLB
            loadModel('assets/3d/container_ship.glb');
        }
        
        // Garante que o tamanho está correto quando o modal é exibido
        onWindowResize();

        // Atualiza a cor de fundo caso o tema mude
        if (scene) {
            scene.background.set(getBackgroundColor());
        }

        // Adiciona um listener para a mudança de tema
        window.addEventListener('theme-changed', onThemeChange);
    });

    model3dModal.addEventListener('hidden.bs.modal', () => {
        // Remove o listener para evitar memória leak
        window.removeEventListener('theme-changed', onThemeChange);
        
        // Limpa a cena para economizar recursos (opcional, dependendo do uso)
        if (renderer) {
            renderer.dispose();
            renderer = null;
            container.innerHTML = '';
            model = null;
            scene = null;
            camera = null;
            controls = null;
            isModelLoaded = false;
        }
    });

    window.addEventListener('resize', onWindowResize, false);
    
    // Handler para a mudança de tema
    function onThemeChange() {
        if (scene) {
            scene.background.set(getBackgroundColor());
        }
    }

    // Lógica para o loading e mensagens de erro
    function showLoadingState() {
        container.innerHTML = `<div class="loading-overlay">
            <div class="spinner-border" role="status"></div>
            <p>Carregando modelo 3D...</p>
        </div>`;
    }

    function updateLoadingProgress(progress) {
        const loadingText = container.querySelector('.loading-overlay p');
        if (loadingText) {
            loadingText.textContent = `Carregando modelo 3D... (${Math.round(progress)}%)`;
        }
    }

    function hideLoadingState() {
        const loadingOverlay = container.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    function showErrorState(message) {
        container.innerHTML = `<div class="error-message">
            <p>${message}</p>
        </div>`;
    }
});