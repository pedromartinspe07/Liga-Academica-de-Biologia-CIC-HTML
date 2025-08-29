// js/model.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('model-container');
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

    function initModel() {
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
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        // 2. Loading Manager
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onStart = (url, itemsLoaded, itemsTotal) =>
            console.log(`Started loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`);
        loadingManager.onLoad = () => console.log('Loading complete!');
        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) =>
            console.log(`Loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`);
        loadingManager.onError = (url) =>
            console.error(`There was an error loading ${url}`);

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
                model.scale.set(1.5, 1.5, 1.5);
                model.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material.map) {
                            child.material.map.encoding = THREE.sRGBEncoding;
                        }
                        child.material.needsUpdate = true;
                    }
                });
                scene.add(model);
            },
            undefined,
            (error) => console.error('An error happened while loading the model:', error)
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
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // 8. Cleanup
        window.addEventListener('beforeunload', () => {
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => {
                            if ('dispose' in m) m.dispose();
                        });
                    } else if ('dispose' in object.material) {
                        object.material.dispose();
                    }
                }
            });
            renderer.dispose();
            controls.dispose();
        });
    }
});