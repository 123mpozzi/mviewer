// Export Settings

/*
// parameters TODO: ui in HTML (also light?)
const angleX = 0.0,
  angleY = 0.02,
  angleZ = 0.0
const scales = [0.5, 1.0, 1.5] // SMALL, MEDIUM, BIG

let bg = 0xff0000 // TODO: option flag to 'apply lights' if HDR
const useHDRLighting = true


// TODO: most of these settings should be possible to change in the GUI, eg: takeScreens, nScreens, scales and angles, displayNormals

*/

export const PARAMS = {
  angleX: 0.0,
  angleY: 0.02,
  angleZ: 0,
  scales: [0.5, 1.0, 1.5],
  defaultBackground: 'royal_esplanade_1k.hdr',
  /** Whether to change background at each frame */
  randomBackground: false,
  takeScreens: false,
  /** Model scale will change after this number of screenshots */
  nScreens: 50,
  count: 0,
  /** Rendering canvas width */
  width: 500,
  /** Rendering canvas height */
  height: 500,
  /** Default starting bg if error occurs */
  bg: 0xff0000,
  /** Apply HDR environmental lighting even when setting static texture as background */
  useHDRLighting: true,
  /** For debugging purposes: whether to apply on the model its normal map */
  displayNormals: false,
  /** Whether to resize the rendering canvas to fit the size of the browser window */
  resizeToWindowSize: false
}

var camera, scene, renderer, model, textureLoader, hdrLoader
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
