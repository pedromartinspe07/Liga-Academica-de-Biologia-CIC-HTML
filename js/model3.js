/*
 * model3.js - Módulo para visualização de modelos 3D com Three.js.
 * Este script gerencia a inicialização, carregamento e interação
 * com o modelo de recife de coral dentro de um modal.
 */

document.addEventListener('DOMContentLoaded', () => {

    const model3dModal = document.getElementById('model3dModal');
    if (!model3dModal) {
        console.warn("Elemento com o ID 'model3dModal' não foi encontrado. O script não será inicializado.");
        return;
    }

    const container = document.getElementById('coral-reef-model-container');
    if (!container) {
        console.error("Elemento com o ID 'coral-reef-model-container' não foi encontrado. A visualização 3D não pode ser renderizada.");
        return;
    }

    // Variáveis de escopo local para o módulo
    let scene, camera, renderer, model, controls, animationFrameId;
    let isInitialized = false;

    /**
     * @function initThreeJS
     * Inicializa a cena, câmera, renderizador e controles do Three.js.
     * Esta função é chamada apenas na primeira vez que o modal é aberto.
     */
    function initThreeJS() {
        if (isInitialized) return;

        // Cena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(getBackgroundColor());
        
        // Câmera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(2.5, 2.5, 5); // Posição inicial ajustada para o modelo de recife
        
        // Renderizador
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

        // Carregar o modelo
        loadModel('assets/3d/coral_reef.glb');

        // Inicia o loop de animação
        animate();
        isInitialized = true;
    }

    /**
     * @function getBackgroundColor
     * Determina a cor de fundo da cena com base no tema atual (claro/escuro).
     * @returns {number} Cor de fundo em hexadecimal.
     */
    function getBackgroundColor() {
        // Assume que o modo escuro é ativado por uma classe no body
        const isDarkMode = document.body.classList.contains('dark-mode');
        return isDarkMode ? 0x2c313a : 0xf0f0f0;
    }

    /**
     * @function loadModel
     * Carrega o modelo 3D GLTF de forma assíncrona com feedback de progresso.
     * @param {string} url - O caminho para o arquivo do modelo.
     */
    function loadModel(url) {
        showLoadingState();

        const loader = new THREE.GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                model = gltf.scene;
                // Centraliza o modelo
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);
                scene.add(model);
                hideLoadingState();
                console.log('Modelo de recife de coral carregado com sucesso!');
            },
            (xhr) => {
                // Progresso de carregamento
                const progress = (xhr.loaded / xhr.total) * 100;
                updateLoadingProgress(progress);
            },
            (error) => {
                console.error('Um erro ocorreu durante o carregamento do modelo 3D:', error);
                showErrorState('Não foi possível carregar o modelo. Tente novamente mais tarde.');
            }
        );
    }

    /**
     * @function animate
     * Loop de animação que renderiza a cena a cada frame.
     */
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    /**
     * @function onWindowResize
     * Atualiza o tamanho do renderizador e a proporção da câmera.
     */
    function onWindowResize() {
        if (!renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    /**
     * @function disposeThreeJS
     * Limpa a cena, o renderizador e os listeners para liberar recursos.
     * Esta função é chamada quando o modal é fechado.
     */
    function disposeThreeJS() {
        if (!renderer) return;

        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        if (controls) controls.dispose();
        
        // Remove o canvas do DOM
        const canvas = container.querySelector('canvas');
        if (canvas) {
            container.removeChild(canvas);
        }

        renderer = null;
        scene = null;
        camera = null;
        controls = null;
        model = null;
        isInitialized = false;

        console.log('Recursos do Three.js liberados.');
    }

    // Funções de feedback para o usuário
    function showLoadingState() {
        container.innerHTML = `<div class="loading-overlay">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-center">Carregando modelo 3D...</p>
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
            <p class="text-danger text-center">${message}</p>
        </div>`;
    }

    // Event Listeners do Modal
    model3dModal.addEventListener('shown.bs.modal', () => {
        initThreeJS();
        onWindowResize();
        
        if (scene) {
            scene.background.set(getBackgroundColor());
        }
    });

    model3dModal.addEventListener('hidden.bs.modal', () => {
        disposeThreeJS();
    });

    // Event Listener do Redimensionamento da Janela
    window.addEventListener('resize', onWindowResize, false);
});