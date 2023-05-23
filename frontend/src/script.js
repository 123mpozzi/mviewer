// Export Settings ?


/** Global parameters of the application */
export const PARAMS = {
  /** Increase on the model's X angle to apply at each model update */
  angleX: 0.0,
  /** Increase on the model's Y angle to apply at each model update */
  angleY: 0.02,
  /** Increase on the model's Z angle to apply at each model update */
  angleZ: 0,
  /** Scale transformations to apply to the model. Should represent SMALL, MEDIUM, BIG sizes */
  scales: [0.5, 1.0, 1.5],
  /** Chance [0, 1] to trigger a modification on the model's scale at each model update */
  chanceToModifyScale: 0.05,
  /** Resource representing the default model to load into the scene */
  defaultModel: 'http://localhost:8000/api/models/DEFAULT_MODEL',
  /** Resource representing the default background to load into the scene */
  defaultBackground: 'http://localhost:8000/api/backgrounds/DEFAULT_BACKGROUND',
  /** Resource to query to get the URI of a random background  */
  randomBackgroundGET: 'http://localhost:8000/api/randombg',
  /** Resource to query to get the list of available (uploaded) models */
  modelListGET: 'http://localhost:8000/api/models',
  /** Whether to change background at each frame */
  randomBackground: false,
  /** Flag to activate the screenshotting function of the application */
  takeScreens: false,
  /** Amount of screenshots to take */
  nScreens: 50,
  /** Width of the rendering canvas */
  width: 500,
  /** Height of the rendering canvas */
  height: 500,
  /** Whether to apply the lighting of a HDR environment even when the background is a static texture or a uniform color (recommended). If false, basic lighting will be applied instead */
  useHDRLighting: true,
  /** Whether to apply on the model its normal map (for debugging purposes) */
  displayNormals: false,
  /** Whether to resize the rendering canvas to fit the size of the browser window */
  resizeToWindowSize: false
}

var camera, scene, renderer, model, textureLoader, hdrLoader, loader
/** Hold the state of THREE.js objects */
export const main = {
  get camera () {
    return camera
  },
  set camera (value) {
    camera = value
  },
  get scene () {
    return scene
  },
  set scene (value) {
    scene = value
  },
  get renderer () {
    return renderer
  },
  set renderer (value) {
    renderer = value
  },
  get model () {
    return model
  },
  set model (value) {
    model = value
  },
  get textureLoader () {
    return textureLoader
  },
  set textureLoader (value) {
    textureLoader = value
  },
  get hdrLoader () {
    return hdrLoader
  },
  set hdrLoader (value) {
    hdrLoader = value
  },
  get loader () {
    return loader
  },
  set loader (value) {
    loader = value
  }
}

// Export Modules

export * as THREE from 'three'

export { OrbitControls } from 'three/addons/controls/OrbitControls.js'
export { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
export { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

export * as dat from 'dat.gui'

export * from './render.js'
export * from './scene.js'
export * from './gui.js'

// START

import { init } from './render.js'

init()
