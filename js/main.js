import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


let camera, scene, renderer;
let model;
let angleX = 0.00, angleY = 0.02, angleZ = 0.00;

init();
render();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( - 1.8, 0.6, 2.7 );

    scene = new THREE.Scene();

    new RGBELoader()
        .setPath( 'static/backgrounds/' )
        .load( 'royal_esplanade_1k.hdr', function ( texture ) {     // add HDR background

            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.background = texture;
            scene.environment = texture;

            render(); // start rendering background

            // Add GLTF model
            const loader = new GLTFLoader().setPath( 'static/models/gemring2/' );
            
            loader.load( 'scene.gltf', function ( gltf ) {
                model = gltf.scene;
                scene.add( model );
                animate();
                //render();
            } );

        } );

    renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setSize( 768, 768 );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 4;
    renderer.outputEncoding = THREE.sRGBEncoding;
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
    render();
}

function render() {
    renderer.render( scene, camera );
    //saveAsImage();
}


// Screenshot Utils
function saveAsImage() {
    var imgData, imgNode;

    try {
        var strMime = "image/jpeg";
        var strDownloadMime = "image/octet-stream";

        imgData = renderer.domElement.toDataURL(strMime);

        // client side
        //saveFile(imgData.replace(strMime, strDownloadMime), "screenshot.jpg");
        //postFile(imgData.replace(strMime, strDownloadMime), "screenshot.png"); // TODO: model name, also can upload new models

        var request = require('request');
        request({
            url: "http://127.0.0.1:5173/".concat(filename),
            method: "POST",
            body: strData
        }, function (error, response, body){
            console.log(response);
        });

    } catch (e) {
        console.log(e);
        return;
    }

}

var postFile = function(strData, filename) {
    request({
        url: "http://127.0.0.1:5173/".concat(filename),
        method: "POST",
        body: strData
    }, function (error, response, body){
        console.log(response);
    });
}

var saveFile = function (strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}

