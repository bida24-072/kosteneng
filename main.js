import * as THREE from 'three';

// --- 1. SCENE SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for mobile
container.appendChild(renderer.domElement);

// --- 2. CREATE THE SMOKE TEXTURE (Via Canvas) ---
// We draw a soft, blurry white circle and use it as the shape for our particles
function createSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Radial gradient for soft edges
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    return new THREE.CanvasTexture(canvas);
}

const smokeTexture = createSmokeTexture();

// --- 3. CREATE THE PARTICLES ---
const particleCount = 1500;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = []; // To store speed for each particle

for (let i = 0; i < particleCount; i++) {
    // Spread particles across the screen
    const x = (Math.random() - 0.5) * 30;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 10;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Random drift velocity for each particle
    velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
    });
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material with Additive Blending makes the smoke look glowing and thick
const material = new THREE.PointsMaterial({
    map: smokeTexture,
    color: 0x888888, // Grey smoke. Change to 0x555555 for darker, or 0xff4444 for red smoke
    size: 8,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const smokeParticles = new THREE.Points(geometry, material);
scene.add(smokeParticles);

// --- 4. MOUSE INTERACTION ---
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// Track mouse/touch movement
window.addEventListener('mousemove', (e) => {
    // Normalize coordinates (-1 to 1)
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Once the user moves the mouse, reveal the content!
    document.body.classList.add('revealed');
});

window.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        document.body.classList.add('revealed');
    }
});

// --- 5. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Smooth mouse lerp
    targetMouseX += (mouseX - targetMouseX) * 0.05;
    targetMouseY += (mouseY - targetMouseY) * 0.05;

    const positions = geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 1. Natural drift
        positions[i3] += velocities[i].x;
        positions[i3 + 1] += velocities[i].y;
        positions[i3 + 2] += velocities[i].z;

        // 2. Mouse Repulsion (The "Reveal" effect)
        // If particles get close to the mouse, push them away
        const dx = positions[i3] - (targetMouseX * 15);
        const dy = positions[i3 + 1] - (targetMouseY * 15);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 6) {
            // Push force gets stronger the closer you get
            const force = (6 - distance) / 6;
            positions[i3] += (dx / distance) * force * 0.2;
            positions[i3 + 1] += (dy / distance) * force * 0.2;
        }

        // 3. Swirling/Wavy effect using Sine waves
        positions[i3] += Math.sin(time + positions[i3 + 1]) * 0.005;
        positions[i3 + 1] += Math.cos(time + positions[i3]) * 0.005;
    }

    geometry.attributes.position.needsUpdate = true;

    // Slight camera sway for 3D depth
    camera.position.x = Math.sin(time * 0.2) * 1;
    camera.position.y = Math.cos(time * 0.2) * 1;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
