import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


let camera, scene, renderer;
let model;
let textureLoader, hdrLoader;

// parameters TODO: ui in HTML (also light?)
const angleX = 0.00, angleY = 0.02, angleZ = 0.00;
const scaleX = 0.00, scaleY = 0.00, scaleZ = 0.00;
const width = 500, height = 500;
let bg = 0xFF0000; // TODO: option flag to 'apply lights' if HDR
let takeScreens = false;
const useHDRLighting = true;

// other flags
const resizeToWindow = false;
const displayNormals = false;

init();


function init() {
    // HTML container element which will contain the generated canvas
    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    setupScene();
    setupRenderer();
    
    // Add canvas to HTML
    container.appendChild( renderer.domElement );

    // Allow the camera to orbit around a target
    const controls = new OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );
    controls.update();

    if(resizeToWindow)
        window.addEventListener( 'resize', onWindowResize );
}


function setupScene() {
    // Setup camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( - 1.8, 0.6, 2.7 );

    scene = new THREE.Scene();
    setupEnvironment('royal_esplanade_1k.hdr', useHDRLighting);
    setupModel();
}

function setupEnvironment( defaultEnv = 'royal_esplanade_1k.hdr', applyEnvLighting = true ) {
    if(!applyEnvLighting) {  // decent light
        const ambientLight = new THREE.AmbientLight(0xededed, 0.8);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.add(directionalLight);
        directionalLight.position.set(10, 11, 7);
    }

    hdrLoader = new RGBELoader().setPath( 'backgrounds/' );

    loadHdr(defaultEnv, applyEnvLighting);
    //loadHdr('abandoned_tiled_room_1k.hdr', false);
}

function loadHdr( file, applyLighting = false ) {
    if(!hdrLoader)
        hdrLoader = new RGBELoader().setPath( 'backgrounds/' );
    
    hdrLoader.load( file, function ( texture ) {  // handle HDR environments
        texture.mapping = THREE.EquirectangularReflectionMapping; // map spheric texture to scene

        // apply good lighting (default is taken from royal_esplanade_1k.hdr)
        if(applyLighting)
            scene.environment = texture;
        
        scene.background = texture;
        texture.dispose();
    } );
}

function loadTexture( file ) {
    if(!textureLoader)
        textureLoader = new THREE.TextureLoader().setPath( 'backgrounds/' );
    
    textureLoader.load( file, function ( texture ) {  // handle img backgrounds
        scene.background = texture;
        texture.dispose();
    } );
}

function setupModel() {
    // set path to models folder
    const loader = new GLTFLoader().setPath( 'models/' );

    // Add GLTF model
    loader.load( 'ring_gold_with_diamond.glb', function ( gltf ) {
        model = gltf.scene;
        scene.add( model );
        if(displayNormals) {
            applyNormals(model);
        }
        animate();
    } );
}

function setupRenderer() {
    // Init renderer
    renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    
    // Set canvas size
    if(resizeToWindow) {
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    else {
        resizeWindow(width, height);
    }
    
    // for better visualization
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 4;
    renderer.outputEncoding = THREE.sRGBEncoding;

    return renderer;
}


// background either string: 'image1.png', 'image2.hdr', or hex: 0xFFFFFF, 0xEDEDED
// TODO: also gradients (maybe can do them with lighting?)
function setBackground( background ) {
    if(scene.background == background)
        return;

    try {
        const arr = background.split('.');
        if(arr.length < 2)
            return;
        const ext = arr.slice(-1); // last slice is extension

        if(ext == 'hdr' || ext == 'hdri') {
            loadHdr(background);
        } 
        else {
            loadTexture(background);
        }
    }
    catch {
        scene.background = new THREE.Color(background);
    }    
}

function resizeWindow( height, width ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( height, width );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

// Change Model angle
function animate () {
    if (model) {
        // modify angle
        model.rotation.x += angleX;
        model.rotation.y += angleY;
        model.rotation.z += angleZ;

        // Modify scale
        model.scale.x += scaleX;
        model.scale.y += scaleY;
        model.scale.z += scaleZ;
    }

    // Modify background
    if(Math.random() < 0.5) {
        bg = Number(genRanHex(6));
    }
    else { // use a texture
        // TODO: GET backgrounds from fastAPI and randomize
        const arr = ['sky.jpg', 'royal_esplanade_1k.hdr', 'abandoned_tiled_room_1k.hdr'];
        bg = arr[Math.floor(Math.random() * arr.length)];
    }
    //setBackground(bg);

    requestAnimationFrame(animate);

    if(takeScreens)
      takeScreenshot(); // TODO: very fast, is right?
    
    render();
}

function render() {
    renderer.render( scene, camera );
}

// Take and send a screenshot to the server
// TODO: pack N screens?
function takeScreenshot() {
    const debug = false;
    var imgData;

    try {
        var strMime = "image/jpeg";

        // canvas to base64 img data string
        imgData = renderer.domElement.toDataURL(strMime);
        if(debug) {
            console.log(JSON.stringify({
                input_data: imgData,
            }));
        }

        fetch("http://localhost:8000/screen/", {
            method: "POST",
            body: JSON.stringify({
                input_data: imgData,
            }),
            headers: {
                contentType: "application/json; charset=utf-8",
            },
        });
    } catch (e) {
        console.log(e);
        return;
    }
}

// Apply to the model its normal map, to visualize it
// Useful when model is not rendering correctly (eg. transparency)
function applyNormals( model ) {
    if ( model ) {
        model.traverse((o) => {
            //if(o.isMesh) console.log(o); // debug
            if(o.isMesh) o.material = new THREE.MeshNormalMaterial;
        });
    }
}
