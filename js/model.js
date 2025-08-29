import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('model-container');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const errorMessage = document.getElementById('error-message');

    if (!container) return;

    // Use IntersectionObserver to load the model only when it's in view
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
            errorMessage.classList.add('d-none');
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
            errorMessage.classList.remove('d-none');
        }
        hideLoading();
    }

    function initModel() {
        showLoading();

        // 1. Scene, Camera, and Renderer Setup
        const scene = new THREE.Scene();
        scene.fog = null;

        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            20000
        );
        camera.position.set(0, 5, 25);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        // 2. Loading Manager
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            // Update loading indicator, e.g., a progress bar or text
        };
        loadingManager.onError = (url) => {
            showError(`Erro ao carregar o arquivo: ${url}`);
        };

        // 3. HDRI
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        new EXRLoader(loadingManager)
            .setPath('assets/3d/')
            .load('qwantani_moonrise_puresky_4k.exr', (texture) => {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                texture.dispose();
                pmremGenerator.dispose();
                scene.environment = envMap;
                scene.background = envMap;
            });

        // 4. GLB Model
        const loader = new GLTFLoader(loadingManager);
        let model;

        loader.load(
            'assets/3d/container_ship.glb',
            (gltf) => {
                model = gltf.scene;
                
                // Calculate bounding box and center the model
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                
                // Adjust position to center the model
                model.position.x += (model.position.x - center.x);
                model.position.y += (model.position.y - center.y);
                model.position.z += (model.position.z - center.z);

                // Scale the model to fit the view
                const maxDim = Math.max(size.x, size.y, size.z);
                const desiredScale = 5 / maxDim; // Adjust 5 to your desired size
                model.scale.set(desiredScale, desiredScale, desiredScale);
                
                model.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material.map) {
                            child.material.map.encoding = THREE.sRGBEncoding;
                        }
                        child.material.needsUpdate = true;
                    }
                });
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
