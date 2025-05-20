import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Configuration ---
const GLOBE_RADIUS = 5;
const POINT_SIZE = 0.03;
const POINT_COLOR = 0xff0000; // Red
const DATA_URL = 'https://speed.cloudflare.com/locations';
// A simple world map texture (replace with a higher quality one if desired)
const TEXTURE_URL = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg'; // Example Texture

// --- Scene Setup ---
let scene, camera, renderer, globe, controls;
const loadingElement = document.getElementById('loading');

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Globe
    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(TEXTURE_URL, (texture) => {
        const globeMaterial = new THREE.MeshPhongMaterial({ map: texture });
        globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);
        fetchLocationData(); // Load data after texture is loaded
    }, undefined, (error) => {
        console.error('An error occurred while loading the texture:', error);
        // Fallback material if texture fails to load
        const globeMaterial = new THREE.MeshPhongMaterial({ color: 0x0077ff, wireframe: true });
        globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);
        fetchLocationData();
    });


    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = GLOBE_RADIUS + 1;
    controls.maxDistance = GLOBE_RADIUS * 5;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// --- Data Handling ---
async function fetchLocationData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const locations = await response.json();
        plotLocations(locations);
        if (loadingElement) loadingElement.style.display = 'none';
    } catch (error) {
        console.error("Could not fetch location data:", error);
        if (loadingElement) loadingElement.innerText = 'Failed to load data.';
    }
}

function plotLocations(locations) {
    if (!globe) {
        console.error("Globe is not initialized yet.");
        return;
    }

    const pointGeometry = new THREE.SphereGeometry(POINT_SIZE, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: POINT_COLOR });

    locations.forEach(location => {
        if (location.latitude && location.longitude) {
            const lat = parseFloat(location.latitude);
            const lon = parseFloat(location.longitude);

            // Convert lat/lon to 3D coordinates
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);

            const x = -(GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta));
            const z = (GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta));
            const y = (GLOBE_RADIUS * Math.cos(phi));

            const point = new THREE.Mesh(pointGeometry, pointMaterial);
            point.position.set(x, y, z);
            globe.add(point); // Add points as children of the globe so they rotate with it
        }
    });
}

// --- Animation & Rendering ---
function animate() {
    requestAnimationFrame(animate);

    if (globe) {
        globe.rotation.y += 0.0005; // Slow continuous spin
    }
    controls.update(); // Only if damping or autoRotate is enabled
    renderer.render(scene, camera);
}

// --- Event Handlers ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Start ---
init();
