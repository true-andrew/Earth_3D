import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */
const earthParameters = {}
earthParameters.atmosphereDayColor = '#00aaff'
earthParameters.atmosphereTwilightColor = '#ff6600'

// Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8

const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthSpecularCloudsTexture.anisotropy = 8

// Mesh
const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
        {
            uDayTexture: new THREE.Uniform(earthDayTexture),
            uNightTexture: new THREE.Uniform(earthNightTexture),
            uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
            uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
            uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
            uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
        }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
        {
            uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
            uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
            uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
        },
})

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.set(1.04, 1.04, 1.04)
scene.add(atmosphere)

//Capitals pins
function createPinMesh() {
    return new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 20, 20),
        new THREE.MeshBasicMaterial({color: 'blue'})
    );
}


function convertSphericalCoordsToCart(lon, lat) {
    const rad = Math.PI / 180;
    const phi = (90 - lat) * rad;
    const theta = (lon + 180) * rad;

    let x = -Math.sin(phi) * Math.cos(theta);
    let y = Math.cos(phi)
    let z = Math.sin(phi) * Math.sin(theta);

    return [x, y, z];
}

const BERLIN = {
    lat: 52.31,
    lon: 13.24
};

const AMSTERDAM = {
    lat: 52.12,
    lon: 5.16
};

const BRUSSELS = {
    lat: 50.84656,
    lon: 4.35170
}

const WIEN = {
    lat: 48.2084,
    lon: 16.3720
};

const STOCKHOLM = {
    lat: 59.32512,
    lon: 18.07109
};

const HELSINKI = {
    lat: 60.16749,
    lon: 24.94275
};

const OSLO = {
    lat: 59.91333,
    lon: 10.73897
}

const COPENHAGEN = {
    lat: 55.68672,
    lon: 12.57007
}

const LONDON = {
    lat: 51.50745,
    lon: -0.12777
}

function createPinsForCities(cities) {
    const result = [];

    for (let i = 0, leni = cities.length; i < leni; i++) {
        const city = cities[i];
        const cityCoords = convertSphericalCoordsToCart(city.lon, city.lat);
        const mesh = createPinMesh();

        mesh.position.set.apply(mesh.position, cityCoords);

        result.push(mesh);
    }

    return result;
}

const pins = createPinsForCities([BERLIN, AMSTERDAM, BRUSSELS, WIEN, STOCKHOLM, HELSINKI, OSLO, COPENHAGEN, LONDON]);
const group = new THREE.Group();

group.add(...pins);

scene.add(group);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    const deltaAngle = elapsedTime * 0.1;

    earth.rotation.y = deltaAngle
    group.rotation.y = deltaAngle

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()