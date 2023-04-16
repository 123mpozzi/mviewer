import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


let camera, scene, renderer;
let model;
const angleX = 0.00, angleY = 0.02, angleZ = 0.00;

var hdr_bg = true;

init();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( - 1.8, 0.6, 2.7 );

    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xededed, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    //scene.add(ambientLight);
    //scene.add(directionalLight);
    directionalLight.position.set(10, 11, 7);

    new RGBELoader()
        .setPath( 'backgrounds/' )
        .load( 'royal_esplanade_1k.hdr', function ( texture ) {     // add HDR background

            texture.mapping = THREE.EquirectangularReflectionMapping;

            if(hdr_bg) {
              scene.background = texture;
              scene.environment = texture;
            } else {
                //scene.background = new THREE.Color(0xffffff);
            }

            render(); // start rendering background

            // Add GLTF model
            //const loader = new GLTFLoader().setPath( 'static/models/gemring2/' );
            
            //loader.load( 'scene.gltf', function ( gltf ) {
            
            // set path to models folder
            const loader = new GLTFLoader().setPath( 'models/' );
            
            loader.load( 'ring_gold_with_diamond.glb', function ( gltf ) {
                model = gltf.scene;
                /*model.traverse((o) => {
                    if(o.isMesh) console.log(o);
                    //if(o.isMesh) o.material = new THREE.MeshNormalMaterial;
                    if(o.isMesh) o.material.transparent = false;
                });*/
                scene.add( model );
                animate();
            } );

        } );

    renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setSize( 768, 768 );
    if(hdr_bg) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 4;
      renderer.outputEncoding = THREE.sRGBEncoding;
    } else {
        renderer.setClearColor(0xababab, 0.5);
    }
    
    
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    //controls.addEventListener( 'change', render ); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set( 0, 0, - 0.2 );
    controls.update();

    //window.addEventListener( 'resize', onWindowResize );
}



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}


// Change Model angle
function animate () {
    if (model) {
        model.rotation.x += angleX;
        model.rotation.y += angleY;
        model.rotation.z += angleZ;
    }
    requestAnimationFrame(animate);
    takeScreenshot();
    render();
}

function render() {
    renderer.render( scene, camera );
    //saveAsImage();
}


function takeScreenshot() {
    var imgData, imgNode;

    try {
        var strMime = "image/jpeg";
        var strDownloadMime = "image/octet-stream";

        imgData = renderer.domElement.toDataURL(strMime);
        console.log(JSON.stringify({
            input_data: imgData,
        }));

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
