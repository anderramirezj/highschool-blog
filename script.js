// Initialize Three.js scene for pages that need it
let scene, camera, renderer, handModel;

function initThreeJS() {
    if (!document.getElementById('canvas-container')) return;

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load hand model
    const loader = new THREE.GLTFLoader();
    loader.load(
        '../models/hand.glb',
        function (gltf) {
            handModel = gltf.scene;
            handModel.scale.set(2, 2, 2);
            handModel.position.y = 0;
            
            // Set material color
            handModel.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.set(0x333333);
                    child.material.metalness = 0.1;
                    child.material.roughness = 0.8;
                }
            });
            
            scene.add(handModel);
            animate();
        },
        undefined,
        function (error) {
            console.error('Error loading model:', error);
            createBasicHand();
        }
    );
}

function createBasicHand() {
    const handGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const fingerGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    handModel = new THREE.Group();
    
    // Palm
    const palm = new THREE.Mesh(handGeometry, handMaterial);
    handModel.add(palm);
    
    // Fingers
    for (let i = 0; i < 5; i++) {
        const finger = new THREE.Mesh(fingerGeometry, handMaterial);
        finger.position.x = (i - 2) * 0.25;
        finger.position.y = 1.1;
        handModel.add(finger);
    }
    
    handModel.scale.set(2, 2, 2);
    scene.add(handModel);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    if (handModel) {
        handModel.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
    }
    
    if (renderer) {
        renderer.render(scene, camera);
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
});