import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


let camera, scene, renderer;
let model;
let textureLoader, hdrLoader;


// parameters TODO: ui in HTML (also light?)
const angleX = 0.00, angleY = 0.02, angleZ = 0.00;
const scales = [0.50, 1.00, 1.50];  // SMALL, MEDIUM, BIG
let takeScreens = true;
const nScreens = 50;
let count  = 0;
//const width = 500, height = 500;
const size = 500;
let bg = 0xFF0000; // TODO: option flag to 'apply lights' if HDR
const useHDRLighting = true;

// other flags
const resizeToWindowSize = false;
const displayNormals = false;

init();


const init = () => {
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

    if(resizeToWindowSize)
        window.addEventListener( 'resize', onWindowResize );
};


const setupGUI = () => {
    if(dat && model && scene) { // dat gui working
        const gui = new dat.GUI(); 

        /*const cubeFolder = gui.addFolder('Controls')
        cubeFolder.add(model.rotation.y, '# Screenshots', 0, 999)
        cubeFolder.add(model.rotation.x, 'StartAngle', 0, Math.PI * 2)
        cubeFolder.add(model.rotation.y, 'updates', 0, 999)
        cubeFolder.add(model.rotation.z, '% change', 0, 100)
        cubeFolder.open()*/
        
        const backgroundFolder  = gui.addFolder('Background');
        const MIN_DIM = Math.min(window.innerWidth, window.innerHeight);
        const canvas = renderer.domElement;
        // look up the size the canvas is being displayed
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const params = {
            color: '#ffffff',
        };
        const sizeParams = {
            get width(){return width;},
            set width(newSize) {
                resizeWindow(newSize, height);
            },
            get height(){return height;},
            set height(newSize) {
                resizeWindow(width, newSize);
            }
        };
        backgroundFolder.addColor(params, 'color').onChange(function(value) {
            setBackground(parseInt(value.slice(1), 16)); // #ffffff to 0xffffff (number)
        });
        backgroundFolder.add(sizeParams, 'width', 100, window.innerWidth);
        backgroundFolder.add(sizeParams, 'height', 100, window.innerHeight);
        backgroundFolder.open();

        const LIMIT = 5;
        const guiCameraControls = {
            get aspect(){return camera.aspect;},
            set aspect(value){
              camera.aspect = value;
              camera.updateProjectionMatrix();
            },
            get fov(){return camera.fov;},
            set fov(value){
              camera.fov = value;
              camera.updateProjectionMatrix();
            },
            get positionX(){return camera.position.x;},
            set positionX(value){
              camera.position.x = value;
              camera.updateMatrixWorld();
            },
            get positionY(){return camera.position.y;},
            set positionY(value){
              camera.position.y = value;
              camera.updateMatrixWorld();
            },
            get positionZ(){return camera.position.z;},
            set positionZ(value){
              camera.position.z = value;
              camera.updateMatrixWorld();
            }
        };
        const cameraFolder  = gui.addFolder('Camera');
        cameraFolder.add(guiCameraControls, 'aspect', 0, 4);
        cameraFolder.add(guiCameraControls, 'fov', 0, 100);
        cameraFolder.add(guiCameraControls, 'positionX', -LIMIT, LIMIT);
        cameraFolder.add(guiCameraControls, 'positionY', -LIMIT, LIMIT);
        cameraFolder.add(guiCameraControls, 'positionZ', -LIMIT, LIMIT);
        cameraFolder.open()
    }
};

const setupScene = () => {
    // Setup camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( - 1.8, 0.6, 2.7 );
    //camera.position.z = 100;

    scene = new THREE.Scene();
    setupEnvironment('royal_esplanade_1k.hdr', useHDRLighting);
    setupModel();
};

const setupEnvironment = (defaultEnv = 'royal_esplanade_1k.hdr', applyEnvLighting = true) => {
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
};

const loadHdr = (file, applyLighting = false) => {
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
};

const loadTexture = file => {
    if(!textureLoader)
        textureLoader = new THREE.TextureLoader().setPath( 'backgrounds/' );
    
    textureLoader.load( file, function ( texture ) {  // handle img backgrounds
        scene.background = texture;
        texture.dispose();
    } );
};

const setupModel = () => {
    // set path to models folder
    const loader = new GLTFLoader().setPath( 'models/' );

    // Add GLTF model
    loader.load( 'ring_gold_with_diamond.glb', function ( gltf ) {
        model = gltf.scene;
        scene.add( model );

        if(displayNormals)
            applyNormals(model);

        setupGUI();
        
        animate();
    } );
};

const setupRenderer = () => {
    // Init renderer
    renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    
    // Set canvas size
    if(resizeToWindowSize)
        renderer.setSize( window.innerWidth, window.innerHeight );
    else
        resizeWindow(size, size);
    
    // for better visualization
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 4;
    renderer.outputEncoding = THREE.sRGBEncoding;

    return renderer;
};


// background either string: 'image1.png', 'image2.hdr', or hex: 0xFFFFFF, 0xEDEDED
// TODO: also gradients (maybe can do them with lighting?)
const setBackground = background => {
    if(scene.background == background)
        return;

    try {
        const arr = background.split('.');
        if(arr.length < 2)
            return;
        const ext = arr.slice(-1); // last slice is extension

        if(ext == 'hdr' || ext == 'hdri')
            loadHdr(background);
        else
            loadTexture(background);
    }
    catch {
        scene.background = new THREE.Color(background);
    }    
};

const resizeWindow = (width, height) => {
    //const RAD2DEG = 114.59155902616465;
    //camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * RAD2DEG;
    //camera.position.z = 50;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( width, height );
};

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

// Change Model angle, scale, and Scene background
const animate = () => {
    if (model) {
        // modify angle
        model.rotation.x += angleX;
        model.rotation.y += angleY;
        model.rotation.z += angleZ;
        //count++;

        // Modify scale only every n screenshots
        if(count > nScreens) {
            const newScale = scales[Math.floor(Math.random() * scales.length)];
            model.scale.set(newScale, newScale, newScale);
            count = 0;
        }
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

    const arrZoom = [0.50, 1.00, 1.50];
    let zoom = arrZoom[Math.floor(Math.random() * arrZoom.length)];
    //camera.zoom = zoom;
    //camera.updateProjectionMatrix();

    requestAnimationFrame(animate);

    if(takeScreens && count < nScreens)
      takeScreenshot(); // TODO: very fast, is right?
    
    count++;
    render();
};

const render = () => {
    renderer.render( scene, camera );
};

// Take and send a screenshot to the server
// TODO: pack N screens?
const takeScreenshot = () => {
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
};

// Apply to the model its normal map, to visualize it
// Useful when model is not rendering correctly (eg. transparency)
const applyNormals = model => {
    if ( model ) {
        model.traverse((o) => {
            //if(o.isMesh) console.log(o); // debug
            if(o.isMesh) o.material = new THREE.MeshNormalMaterial;
        });
    }
};
