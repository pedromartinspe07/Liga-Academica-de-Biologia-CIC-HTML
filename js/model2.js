/*
* model2.js - Módulo para visualização de modelos 3D com Three.js.
* Este script gerencia a inicialização, carregamento e interação
* com um modelo 3D dentro de um modal.
*/

document.addEventListener('DOMContentLoaded', () => {

    const model3dModal = document.getElementById('model3dModal');
    // Aborta a execução se o modal não for encontrado, evitando erros.
    if (!model3dModal) {
        console.warn("Elemento com o ID 'model3dModal' não foi encontrado. O script não será inicializado.");
        return;
    }

    const container = document.getElementById('three-container');
    if (!container) {
        console.error("Elemento com o ID 'three-container' não foi encontrado. A visualização 3D não pode ser renderizada.");
        return;
    }

    // Variáveis globais para a cena 3D, encapsuladas dentro do escopo do DOMContentLoaded
    let scene, camera, renderer, model, controls, animationFrameId;

    /**
     * @function initThreeJS
     * Inicializa a cena, câmera, renderizador e controles do Three.js.
     * Esta função é chamada apenas quando o modal é aberto pela primeira vez.
     */
    function initThreeJS() {
        if (renderer) return; // Evita inicialização duplicada

        // Cena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        // Câmera
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 3);
        
        // Renderizador
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limita o pixel ratio para melhor performance
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

        // Carregar Modelo
        loadModel('assets/3d/smart_water.glb');

        // Inicia o loop de animação
        animate();
    }

    /**
     * @function loadModel
     * Carrega o modelo 3D GLTF de forma assíncrona.
     * @param {string} url - O caminho para o arquivo do modelo.
     */
    function loadModel(url) {
        const loader = new THREE.GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                model = gltf.scene;
                // Centraliza e ajusta o modelo na cena
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);
                scene.add(model);
                console.log('Modelo 3D carregado com sucesso.');
            },
            (xhr) => {
                // Progresso de carregamento (opcional)
                console.log(`Progresso do carregamento: ${Math.round(xhr.loaded / xhr.total * 100)}%`);
            },
            (error) => {
                console.error('Um erro ocorreu durante o carregamento do modelo 3D:', error);
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
        if (!renderer) return;
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

        // Cancela o loop de animação
        cancelAnimationFrame(animationFrameId);
        
        // Limpa a memória do renderizador e da cena
        renderer.dispose();
        if (controls) controls.dispose();
        
        // Remove o canvas do DOM
        container.removeChild(renderer.domElement);

        // Reseta as variáveis para o estado inicial
        renderer = null;
        scene = null;
        camera = null;
        controls = null;
        model = null;

        console.log('Recursos do Three.js liberados.');
    }

    // Event Listeners do Modal
    model3dModal.addEventListener('shown.bs.modal', () => {
        initThreeJS(); // Inicializa a cena quando o modal é exibido
        onWindowResize(); // Garante o redimensionamento correto
    });

    model3dModal.addEventListener('hidden.bs.modal', () => {
        disposeThreeJS(); // Limpa os recursos quando o modal é fechado
    });

    // Event Listener do Redimensionamento da Janela
    window.addEventListener('resize', onWindowResize, false);
});