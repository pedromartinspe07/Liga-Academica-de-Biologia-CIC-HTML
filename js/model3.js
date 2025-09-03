import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.es/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.es/npm/three@0.128.0/examples/js/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('coral-reef-model-container');
    if (!container) {
        console.error("Container 'coral-reef-model-container' não encontrado. Verifique se o ID está correto.");
        return;
    }

    // Gerenciador de carregamento para feedback visual
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => {
        console.log('Iniciando o carregamento do modelo 3D...');
        // Você pode adicionar um spinner ou mensagem de "carregando" aqui, se desejar
    };
    loadingManager.onLoad = () => {
        console.log('Modelo 3D carregado com sucesso!');
        // Remover o spinner ou mensagem de "carregando"
    };
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        console.log(`Carregando arquivo: ${url}. ${itemsLoaded} de ${itemsTotal} carregados.`);
    };
    loadingManager.onError = (url) => {
        console.error('Ocorreu um erro ao carregar o modelo 3D:', url);
        // Exibir uma mensagem de erro para o usuário
        container.innerHTML = '<p class="error-message">Ocorreu um erro ao carregar o modelo 3D.</p>';
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Fundo transparente
    renderer.shadowMap.enabled = true; // Habilita o mapa de sombras
    container.appendChild(renderer.domElement);

    camera.position.set(0, 5, 10);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Luz ambiente suave
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight1.position.set(5, 10, 7.5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-5, 10, -7.5);
    scene.add(directionalLight2);

    // Controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Carregar o modelo 3D
    const loader = new GLTFLoader(loadingManager);
    loader.load(
        'assets/3d/coral_reef.glb',
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Ajusta automaticamente a posição da câmera e do modelo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * 1.5 / Math.sin(fov / 2));
            
            camera.position.set(center.x, center.y, center.z + cameraZ);
            controls.target.set(center.x, center.y, center.z);
            
            // Animar a cena
            const animate = () => {
                requestAnimationFrame(animate);
                controls.update();
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
