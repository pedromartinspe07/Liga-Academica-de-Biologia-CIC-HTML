import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.es/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.es/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('coral-reef-model-container');
    if (!container) {
        console.error("Container 'coral-reef-model-container' não encontrado.");
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Fundo transparente
    container.appendChild(renderer.domElement);

    camera.position.set(0, 5, 10);

    // Iluminação
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Carregar o modelo 3D
    const loader = new GLTFLoader();
    loader.load(
        'assets/3d/coral_reef.glb',
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Animar o modelo (opcional, para uma rotação suave)
            const animate = () => {
                requestAnimationFrame(animate);
                controls.update(); // Necessário se enableDamping estiver ativado
                renderer.render(scene, camera);
            };
            animate();
        },
        undefined,
        (error) => {
            console.error('Ocorreu um erro ao carregar o modelo GLB:', error);
        }
    );

    // Ajustar o tamanho quando a janela for redimensionada
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});

