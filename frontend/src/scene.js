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

const loadHdr = (file, applyLighting = false) => {
  if (!main.hdrLoader) main.hdrLoader = new RGBELoader().setPath(DEFAULT_BACKGROUNDS_DIR)

  main.hdrLoader.load(file, function (texture) {
    // handle HDR environments
    texture.mapping = THREE.EquirectangularReflectionMapping // map spheric texture to scene

    // Apply good lighting (default is taken from royal_esplanade_1k.hdr)
    if (applyLighting) main.scene.environment = texture

    main.scene.background = texture
    texture.dispose()
  })
}

const loadTexture = file => {
  if (!main.textureLoader) main.textureLoader = new THREE.TextureLoader().setPath(DEFAULT_BACKGROUNDS_DIR)

  main.textureLoader.load(file, function (texture) {
    // handle img backgrounds
    main.scene.background = texture
    texture.dispose()
  })
}

// Apply to the model its normal map, to visualize it
// Useful when model is not rendering correctly (eg. transparency)
export const applyNormals = model => {
  if (model) {
    model.traverse(o => {
      //if(o.isMesh) console.log(o); // debug
      if (o.isMesh) o.material = new THREE.MeshNormalMaterial()
    })
  }
}

const setupModel = () => {
  // set path to models folder
  const loader = new GLTFLoader().setPath(DEFAULT_MODELS_DIR)

  // Add GLTF model
  loader.load('ring_gold_with_diamond.glb', function (gltf) {
    main.model = gltf.scene
    main.scene.add(main.model)

    if (PARAMS.displayNormals) applyNormals(main.model)

    setupGUI()
    animate()
  })
}

// background either string: 'image1.png', 'image2.hdr', or hex: 0xFFFFFF, 0xEDEDED
// TODO: also gradients (maybe can do them with lighting?--)
export const setBackground = background => {
  //if (main.scene.background === background)
  //  // continue if same background
  //  return

  // Try setting a file as background
  try {
    const arr = background.split('.')
    if (arr.length < 2) return
    const ext = arr.slice(-1) // last slice is the file extension

    if (ext === 'hdr' || ext === 'hdri') loadHdr(background) // Either a HDR file
    else loadTexture(background) // Or a simple image
  } catch {
    // It is just a color string
    main.scene.background = new THREE.Color(background)
  }
}
