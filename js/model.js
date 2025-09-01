import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('model-container');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const errorMessage = document.getElementById('error-message');

    if (!container) return;

    const containerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initModel();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    containerObserver.observe(container);

    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '1';
            loadingOverlay.style.pointerEvents = 'auto';
        }
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }

    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.pointerEvents = 'none';
        }
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }
        hideLoading();
    }

    function initModel() {
        console.log('Inicializando o modelo 3D...');
        showLoading();

        // 1. Scene
        const scene = new THREE.Scene();
        scene.background = null;

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 1, 3);

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0); // Fundo transparente
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        // 4. Lighting & Environment
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        new RGBELoader()
            .setDataType(THREE.FloatType)
            // Caminho corrigido para o mapa de ambiente
            .setPath('../assets/3d/')
            .load('qwantani_moonrise_puresky_4k.exr', (texture) => {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                scene.environment = envMap;
                texture.dispose();
                pmremGenerator.dispose();
            }, undefined, (error) => {
                console.error('An error happened while loading the environment map:', error);
            });

        let model;
        const loader = new GLTFLoader();
        // Caminho corrigido para o modelo 3D
        loader.load(
            '../assets/3d/container_ship.glb',
            (gltf) => {
                model = gltf.scene;
                scene.add(model);
                hideLoading();
            },
            undefined,
            (error) => {
                console.error('An error happened while loading the model:', error);
                showError('Falha ao carregar o modelo 3D. Tente novamente mais tarde.');
            }
        );

        // 5. Orbit Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        let isUserInteracting = false;
        controls.addEventListener('start', () => { isUserInteracting = true; });
        controls.addEventListener('end', () => { isUserInteracting = false; });

        // 6. Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            if (model && !isUserInteracting) {
                model.rotation.y += 0.005;
            }

            renderer.render(scene, camera);
        }
        animate();

        // 7. Responsive Resize
        function onWindowResize() {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }
        window.addEventListener('resize', onWindowResize);
    }
});