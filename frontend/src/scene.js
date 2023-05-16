import { THREE, GLTFLoader, RGBELoader, main, PARAMS, setupGUI, animate } from './script.js'

export const setupScene = () => {
  // Setup camera
  main.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 20)
  main.camera.position.set(-1.8, 0.6, 2.7)
  //camera.position.z = 100;

  main.scene = new THREE.Scene()
  setupEnvironment(PARAMS.defaultBackground, PARAMS.useHDRLighting)
  setupModel()
}

const setupEnvironment = (defaultEnv = PARAMS.defaultBackground, applyEnvLighting = true) => {
  if (!applyEnvLighting) {
    // setup decent light if not getting it from environment
    const ambientLight = new THREE.AmbientLight(0xededed, 0.8)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    main.scene.add(ambientLight)
    main.scene.add(directionalLight)
    directionalLight.position.set(10, 11, 7)
  }

  loadHdr(defaultEnv, applyEnvLighting)
  //loadHdr('abandoned_tiled_room_1k.hdr', false);
}

/**
 * Load a HDR environment as background
 * @param {*} path URL path of the HDR environment
 * @param {*} applyLighting whether to apply the environmental lighting (default is taken from `royal_esplanade_1k.hdr`)
 */
const loadHdr = (path, applyLighting = true) => {
  console.log(path)
  if (!main.hdrLoader) main.hdrLoader = new RGBELoader()

  main.hdrLoader.load(path, function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping // map spheric texture to scene

    // Apply good lighting (default is taken from royal_esplanade_1k.hdr)
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
  console.log(path)
  if (!main.textureLoader) main.textureLoader = new THREE.TextureLoader()

  main.textureLoader.load(path, function (texture) {
    main.scene.background = texture
    texture.dispose()
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
export const setupModel = (path = PARAMS.defaultModel) => {
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

// TODO: also gradients (maybe can do them with lighting?--)
/**
 * Load a background into the scene
 * @param {*} url
 */
export const setBackground = url => {
  // Try setting a file as background
  fetch(url)
  .then(response => response.text())
  .then((response) => {
    if(!response.includes('.')) return

    console.log(response)
    const path = response.split('.')
    const ext = path.slice(-1) // last slice is the file extension

    const url = PARAMS.defaultBackground.replace('DEFAULT_BACKGROUND', response.replaceAll('"', ''))

    if (ext === 'hdr' || ext === 'hdri') loadHdr(url) // Either a HDR file
    else loadTexture(url) // Or a simple image
  })
  .catch(err => console.log(err))
}
