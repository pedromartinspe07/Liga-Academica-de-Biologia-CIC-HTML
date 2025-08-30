import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Importa OrbitControls

// Funções utilitárias
const toRadians = (angle) => angle * (Math.PI / 180);

// Elementos do DOM
const modelContainer = document.getElementById('model-container');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMessage = document.getElementById('error-message');

let renderer, scene, camera, model, controls;

const setupScene = () => {
    try {
        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        modelContainer.appendChild(renderer.domElement);
        
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        
        // Camera
        camera = new THREE.PerspectiveCamera(75, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
        camera.position.set(0, 10, 50);

        // Controles de câmera (substitui a rotação manual)
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Adiciona suavidade ao arrastar
        controls.dampingFactor = 0.05;
        controls.autoRotate = true; // Rotação automática para melhor visualização
        controls.autoRotateSpeed = 0.5;

        // Iluminação
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Carregar HDRI
        const rgbeLoader = new THREE.RGBELoader();
        rgbeLoader.load('assets/3d/model2/qwantani_moonrise_puresky_4k.exr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.background = texture;
        });
        
        // Carregar Modelo GLTF
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('assets/3d/model2/smart_water.glb', (gltf) => {
            model = gltf.scene;
            model.scale.set(0.1, 0.1, 0.1);
            model.position.set(0, -5, 0);
            scene.add(model);
            loadingOverlay.style.display = 'none';
            animate();
        }, (progress) => {
            const percent = Math.floor(progress.loaded / progress.total * 100);
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = `Carregando modelo 3D... ${percent}%`;
            }
        }, (error) => {
            console.error('Erro ao carregar o modelo GLTF', error);
            loadingOverlay.style.display = 'none';
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Erro ao carregar o modelo 3D. Tente novamente mais tarde.';
        });
        
    } catch (e) {
        console.error('Erro de inicialização do Three.js:', e);
        loadingOverlay.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Ocorreu um erro ao inicializar o ambiente 3D. Por favor, recarregue a página.';
    }
};

// Loop de animação
const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // Atualiza os controles de câmera
    renderer.render(scene, camera);
};

// Redimensionamento da janela
const onWindowResize = () => {
    if (camera && renderer) {
        camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    }
};
window.addEventListener('resize', onWindowResize);

// Inicializa a cena quando a modal for exibida
document.getElementById('projectModal').addEventListener('shown.bs.modal', setupScene);