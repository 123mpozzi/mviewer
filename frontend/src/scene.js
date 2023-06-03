import { THREE, GLTFLoader, RGBELoader, main, PARAMS, setupGUI, animate, config, DEF_BG_NAME } from './script.js'

const LIGHT_AMBIENT = "ambientLight"
const LIGHT_DIRECTIONAL = "directionalLight"

/** HTML element representing a dropdown list filled with available models */
const modelSelect = document.getElementById('models');
/** Button to load the list of available models from the server and update {@link modelSelect} */
const reloadSelBtn = document.getElementById('reloadsel');
/** Button to render the selected model into the scene */
const renderSelBtn = document.getElementById('rendersel');

reloadSelBtn.onclick = function() {
  // Fetch available models
  fetch(config.modelListGET)
    .then(response => response.json())
    .then(response => {
      console.log(response)
      console.log(typeof(response))

      // Clear the HTML select element and add the defaut option to the dropdown
      clearSelectOptions(modelSelect)
      const optDef = document.createElement('option');
      optDef.value = 'default';
      optDef.textContent = 'Default';
      modelSelect.options.add(optDef)

      // Add each modelName as a dropdown option to the select HTML element
      response.forEach(modelName => {
        const opt = document.createElement('option');
        opt.value = modelName;
        opt.textContent = modelName;

        modelSelect.options.add(opt)
      });
    })
    .catch(err => console.log(err))
}

renderSelBtn.onclick = function() {
  // Change the rendered model
  const currentSelectValue = reloadSelBtn.options[reloadSelBtn.selectedIndex].text
  console.log(currentSelectValue)
  setupModel(currentSelectValue)
}

/**
 * Remove all option elements from a dropdown select HTML element
 * @param {*} selectElement element to remove options from
 */
const clearSelectOptions = (selectElement) => {
  var i, L = selectElement.options.length - 1;
  for(i = L; i >= 0; i--) {
    selectElement.remove(i);
  }
}


// Items you add to the scene are Object3D objects
const ambientLight = new THREE.AmbientLight(0xededed, 0.8)
ambientLight.name = LIGHT_AMBIENT  // and you can label them to search for them later
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.name = LIGHT_DIRECTIONAL

/**
 * Remove an object from the scene, if it exists
 * @param {*} object name of the Object3D object to remove from the scene
 */
const removeEntity = object => {
  const selectedObject = main.scene.getObjectByName(object.name);
  if(selectedObject) main.scene.remove( selectedObject );
}

export const setupScene = () => {
  // Setup camera
  main.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
  main.camera.position.set(-1.8, 0.6, 2.7)
  //camera.position.z = 100;

  main.scene = new THREE.Scene()
  loadDefaultBackground()
  setupModel()
}

export const loadDefaultBackground = () => {
  loadHdr(config.defaultBackground, PARAMS.useHDRLighting)
}

/**
 * Update the scene lighting settings: either use basic lighting or apply lighting from a HDR environment
 * @param {*} applyLighting whether to apply lighting from a HDR environment
 */
export const udpateLighting = (applyLighting = PARAMS.useHDRLighting) => {
  // use basic lighting (unrecommended)
  if (!applyLighting) {
    // setup decent lighting settings
    main.scene.add(ambientLight)
    main.scene.add(directionalLight)
    directionalLight.position.set(10, 11, 7)
    // remove environment lighting from scene
    main.scene.environment = null
  } else { // remove basic lighting to prepare for HDR lighting
    removeEntity(LIGHT_AMBIENT)
    removeEntity(LIGHT_DIRECTIONAL)
  }
}

/**
 * Load a HDR environment as background
 * @param {*} path URL path of the HDR environment
 * @param {*} applyLighting whether to apply the environmental lighting (default is taken from `royal_esplanade_1k.hdr`)
 */
const loadHdr = (path, applyLighting = PARAMS.useHDRLighting) => {
  if (!main.hdrLoader) main.hdrLoader = new RGBELoader()

  main.hdrLoader.load(path, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping // map spheric texture to scene

    // Apply good lighting (default is taken from royal_esplanade_1k.hdr)
    udpateLighting(applyLighting)
    if (applyLighting) main.scene.environment = texture

    main.scene.background = texture
    texture.dispose()
  })
}

/**
 * Load an image as background
 * @param {*} path URL path of the image
 */
const loadTexture = path => {
  if (!main.textureLoader) main.textureLoader = new THREE.TextureLoader()

  main.textureLoader.load(path, function (texture) {
    main.scene.background = texture
    texture.dispose()

    udpateLighting()
  })
}

/**
 * Apply to the model its normals map, to visualize it.  
 * Useful when model is not rendering correctly (eg. transparency)
 * @param {*} model the model to update
 * @param {*} debug whether to print data of the meshes
 */
export const applyNormals = (model, debug = false) => {
  if (model) {
    model.traverse(o => {
      if (o.isMesh) {
        if (debug) console.log(o);
        o.material = new THREE.MeshNormalMaterial()
      }
    })
  }
}

/**
 * Load a model into the scene.  
 * If there is already a model in the scene, delete it first
 * @param {*} path URL path of the resource to load
 */
export const setupModel = (path = config.defaultModel) => {
  if(!main.loader) main.loader = new GLTFLoader()

  // remove old model from the scene, if present
  if(main.model) main.scene.remove(main.model);

  // Add GLTF model
  main.loader.load(path, function (gltf) {
    main.model = gltf.scene
    main.scene.add(main.model)

    if (PARAMS.displayNormals) applyNormals(main.model)

    // GUI and Animation are dependent on the current model
    setupGUI()
    animate()
  },
  undefined,    // onProgress callback
  (event) => {  // onError callback
    console.error(event)
  })
}

/**
 * Load a texture as the scene background
 * @param {*} url URL of the texture
 */
export const setBackground = url => {
  fetch(url)
  .then(response => response.text())
  .then((response) => {
    if(!response.includes('.')) return

    // The server responds a string like this: "8123.jpg"
    // the quotes are included into the string, remove them
    response = response.replaceAll('"', '')

    const path = response.split('.')
    const ext = path.slice(-1)[0] // last slice is the file extension. Note that slice() returns an Array

    const url = config.defaultBackground.replace(DEF_BG_NAME, response)

    if (ext === 'hdr' || ext === 'hdri') loadHdr(url) // either a HDR file
    else loadTexture(url) // or a simple image
  })
  .catch(err => console.log(err))
}
