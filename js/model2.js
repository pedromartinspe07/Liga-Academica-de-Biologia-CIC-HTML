document.addEventListener('DOMContentLoaded', () => {

    const model3dModal = document.getElementById('model3dModal');
    if (model3dModal) {
        let scene, camera, renderer, model, controls;

        const container = document.getElementById('three-container');

        // Configuração inicial da cena, câmera e renderizador
        function init() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf0f0f0); // Cor de fundo do canvas

            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.set(0, 1.5, 3);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Adicionar luzes para iluminar o modelo
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // Carregar o modelo GLTF
            const loader = new THREE.GLTFLoader();
            loader.load(
                'assets/3d/smart_water.glb',
                function (gltf) {
                    model = gltf.scene;
                    scene.add(model);
                },
                undefined,
                function (error) {
                    console.error('An error happened while loading the 3D model:', error);
                }
            );

            // Adicionar controles de órbita para interação
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.screenSpacePanning = false;
            controls.maxPolarAngle = Math.PI / 2;

            animate();
        }

        // Loop de animação
        function animate() {
            requestAnimationFrame(animate);
            if (controls) {
                controls.update(); // Necessário se enableDamping estiver ativado
            }
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }

        // Funções para lidar com o modal
        model3dModal.addEventListener('shown.bs.modal', () => {
            // Inicializa a cena somente quando o modal é aberto
            if (!renderer) {
                init();
            }
            // Garante que o tamanho do renderizador está correto quando o modal é exibido
            onWindowResize();
        });

        model3dModal.addEventListener('hidden.bs.modal', () => {
            // Limpa a cena para economizar recursos
            if (renderer) {
                renderer.dispose();
                renderer = null;
                container.innerHTML = ''; // Remove o canvas
                model = null;
                scene = null;
                camera = null;
                controls = null;
            }
        });

        // Lidar com o redimensionamento da janela
        function onWindowResize() {
            if (renderer) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
        window.addEventListener('resize', onWindowResize, false);
    }
});