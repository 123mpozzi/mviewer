import { THREE, GLTFLoader, RGBELoader, main, PARAMS, setupGUI, animate } from './script.js'

// Vite copies 'public' directory to root dist directory by default
const DEFAULT_BACKGROUNDS_DIR = 'backgrounds/'
const DEFAULT_MODELS_DIR = 'models/'

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
 * @param {*} path path of the HDR environment
 * @param {*} applyLighting whether to apply the environmental lighting (default is taken from `royal_esplanade_1k.hdr`)
 */
const loadHdr = (path, applyLighting = false) => {
  if (!main.hdrLoader) main.hdrLoader = new RGBELoader().setPath(DEFAULT_BACKGROUNDS_DIR)

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
 * @param {*} path path of the image
 */
const loadTexture = path => {
  if (!main.textureLoader) main.textureLoader = new THREE.TextureLoader().setPath(DEFAULT_BACKGROUNDS_DIR)

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
 * @param {*} modelName path of the model to load
 */
export const setupModel = (modelName = 'ring_gold_with_diamond.glb') => {
  // set path to models folder
  if (!main.loader) main.loader = new GLTFLoader().setPath(DEFAULT_MODELS_DIR)

  // remove old model from the scene, if present
  if(main.model) main.scene.remove(main.model);

  // Add GLTF model
  main.loader.load(modelName, function (gltf) {
    main.model = gltf.scene
    main.scene.add(main.model)

    if (PARAMS.displayNormals) applyNormals(main.model)

    // GUI and Animation are dependent on the current model
    setupGUI()
    animate()
  })
}

// TODO: also gradients (maybe can do them with lighting?--)
/**
 * Load a background into the scene
 * @param {*} background either a path: 'image1.png', 'image2.hdr', or hex: 0xFFFFFF, 0xEDEDED
 */
export const setBackground = background => {
  // Try setting a file as background
  try {
    const arr = background.split('.')
    if (arr.length < 2) return
    const ext = arr.slice(-1) // last slice is the file extension

    const allowed_extensions = ['hdr', 'hdri', 'png', 'jpg', 'jpeg', 'gif', 'bmp']

    // format not supported
    if(!allowed_extensions.includes(ext))
      return

    if (ext === 'hdr' || ext === 'hdri') loadHdr(background) // Either a HDR file
    else loadTexture(background) // Or a simple image
  } catch {  // It is just a color string
    main.scene.background = new THREE.Color(background)
  }
}
