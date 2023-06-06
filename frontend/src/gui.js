import { main, resizeWindow, setBackgroundAsColor, loadDefaultBackground, setupSelectedModel, PARAMS, dat } from './script.js'

let gui

export const setupGUI = () => {
  // Once the dat.GUI library is loaded, you can access it via window.dat or simply dat
  if (dat && main.model && main.scene) {
    // destroy old GUI, if present
    if(gui) gui.destroy()

    gui = new dat.GUI()

    addScreenshotsFolder(gui)
    addCanvasFolder(gui)
    addModelsFolder(gui)
    addCameraFolder(gui)
    addDebugFolder(gui)
  } else {
    console.error('dat.GUI library not loaded')
  }
}

let nScreensElem, takeScreensElem

/** Make the controls of the screenshot folder inside the GUI clickable again */
export function enableScreensGUIs () {
  if (nScreensElem) enable(nScreensElem)
  if (takeScreensElem) enable(takeScreensElem)
}

/** Make a GUI element un-clickable */
const disable = elem => {
  elem.__li.style = 'opacity: 0.5; filter: grayscale(100%) blur(1px); pointer-events: none;'
}

/** Make a GUI element clickable again */
const enable = elem => {
  elem.__li.style = ';'
}

const addScreenshotsFolder = gui => {
  const screensParams = {
    takeScreens: () => {
      if (PARAMS.takeScreens !== true) {
        PARAMS.takeScreens = true
        disable(takeScreensElem)
        disable(nScreensElem)
      }
    },
    nScreens: PARAMS.nScreens
  }

  const screensFolder = gui.addFolder('Screenshot')
  takeScreensElem = screensFolder.add(screensParams, 'takeScreens').name('Take screens?').listen()
  nScreensElem = screensFolder.add(screensParams, 'nScreens').name('Amount').min(50).max(1000).listen()
  screensFolder.open()

  // listeners
  nScreensElem.onChange(function (value) {
    if (PARAMS.takeScreens === false) {
      PARAMS.nScreens = value
    } else {
      disable(nScreensElem)
    }
  })
}

const addCanvasFolder = gui => {
  const canvasFolder = gui.addFolder('Canvas')
  const canvas = main.renderer.domElement

  let canvasDefaults
  const canvasParams = {
    background: '#ffffff',
    width: PARAMS.width,
    height: PARAMS.height,
    useHDRLighting: PARAMS.useHDRLighting,
    randomBackground: PARAMS.useRandomBackground,
    reset: () => {
      resetParameters(canvasParams, canvasDefaults)
      updateCanvas(canvasParams)
    }
  }
  canvasDefaults = Object.assign({}, canvasParams)

  const canvasBackground = canvasFolder.addColor(canvasParams, 'background').listen()
  const canvasWidth = canvasFolder.add(canvasParams, 'width').min(100).max(window.innerWidth).listen()
  const canvasHeight = canvasFolder.add(canvasParams, 'height').min(100).max(window.innerHeight).listen()
  const canvasHDRLighting = canvasFolder.add(canvasParams, 'useHDRLighting').name('Env. lighting?').listen()
  const canvasRandomBackground = canvasFolder
    .add(canvasParams, 'randomBackground')
    .name('Random bg?')
    .listen()
  canvasFolder.add(canvasParams, 'reset').name('Reset Canvas')
  canvasFolder.open()

  // listeners
  canvasBackground.onChange(function (value) {
    setBackgroundAsColor(parseInt(value.slice(1), 16)) // #ffffff to 0xffffff (number)
  })
  canvasWidth.onChange(function (value) {
    resizeWindow(value, canvas.clientHeight)
  })
  canvasHeight.onChange(function (value) {
    resizeWindow(canvas.clientWidth, value)
  })
  canvasHDRLighting.onChange(function (value) {
    if (PARAMS.useHDRLighting !== value) PARAMS.useHDRLighting = value
  })
  canvasRandomBackground.onChange(function (value) {
    if (PARAMS.useRandomBackground !== value) PARAMS.useRandomBackground = value
  })
}

const addModelsFolder = gui => {
  const modelFolder = gui.addFolder('Model')

  let modelDefaults
  const modelParams = {
    angleX: PARAMS.angleX,
    angleY: PARAMS.angleY,
    angleZ: PARAMS.angleZ,
    scaleChance: PARAMS.chanceToModifyScale,
    scaleSmall: PARAMS.scales[0],
    scaleMed: PARAMS.scales[1],
    scaleBig: PARAMS.scales[2],
    reset: () => {
      resetParameters(modelParams, modelDefaults)
      updateModel(modelParams)
    }
  }
  modelDefaults = Object.assign({}, modelParams)

  // TODO: angleX and angleZ goes directly from 0 to 1 without float scaling in the GUI, even if the float scaling are applied to the model
  const modelAngleX = modelFolder.add(modelParams, 'angleX').min(0.0).max(1.0).listen()
  const modelAngleY = modelFolder.add(modelParams, 'angleY').min(0.0).max(1.0).listen()
  const modelAngleZ = modelFolder.add(modelParams, 'angleZ').min(0.0).max(1.0).listen()
  const modelScaleChance = modelFolder.add(modelParams, 'scaleChance').min(0.0).max(1.0).listen()
  const modelScaleSmall = modelFolder.add(modelParams, 'scaleSmall').min(0.0).max(2.0).listen()
  const modelScaleMed = modelFolder.add(modelParams, 'scaleMed').min(0.0).max(3.0).listen()
  const modelScaleBig = modelFolder.add(modelParams, 'scaleBig').min(0.0).max(5.0).listen()
  modelFolder.add(modelParams, 'reset').name('Reset Model')
  modelFolder.open()

  // listeners
  modelAngleX.onChange(function (value) {
    PARAMS.angleX = value
  })
  modelAngleY.onChange(function (value) {
    PARAMS.angleY = value
  })
  modelAngleZ.onChange(function (value) {
    PARAMS.angleZ = value
  })
  modelScaleChance.onChange(function (value) {
    PARAMS.chanceToModifyScale = value
  })
  modelScaleSmall.onChange(function (value) {
    PARAMS.scales[0] = value
  })
  modelScaleMed.onChange(function (value) {
    PARAMS.scales[1] = value
  })
  modelScaleBig.onChange(function (value) {
    PARAMS.scales[2] = value
  })
}

const addCameraFolder = gui => {
  const LIMIT = 2.5

  let cameraDefaults
  const cameraParams = {
    aspect: main.camera.aspect,
    fov: main.camera.fov,
    positionX: main.camera.position.x,
    positionY: main.camera.position.y,
    positionZ: main.camera.position.z,
    reset: () => {
      resetParameters(cameraParams, cameraDefaults)
      updateCamera(cameraParams)
    }
  }
  cameraDefaults = Object.assign({}, cameraParams)

  const cameraFolder = gui.addFolder('Camera')
  const cameraAspect = cameraFolder.add(cameraParams, 'aspect', 0.5, 4).listen()
  const cameraFov = cameraFolder.add(cameraParams, 'fov', 10, 100).listen()
  const cameraX = cameraFolder.add(cameraParams, 'positionX', -LIMIT, LIMIT).listen()
  const cameraY = cameraFolder.add(cameraParams, 'positionY', -LIMIT, LIMIT).listen()
  const cameraZ = cameraFolder.add(cameraParams, 'positionZ', -LIMIT, LIMIT).listen()
  cameraFolder.add(cameraParams, 'reset').name('Reset Camera')

  // listeners
  cameraAspect.onChange(function (value) {
    main.camera.aspect = value
    applyCameraChanges()
  })
  cameraFov.onChange(function (value) {
    main.camera.fov = value
    applyCameraChanges()
  })
  cameraX.onChange(function (value) {
    main.camera.position.x = value
    applyCameraChanges()
  })
  cameraY.onChange(function (value) {
    main.camera.position.y = value
    applyCameraChanges()
  })
  cameraZ.onChange(function (value) {
    main.camera.position.z = value
    applyCameraChanges()
  })
}

const addDebugFolder = gui => {
  const debugParams = {
    displayNormals: PARAMS.displayNormals
  }

  const debugFolder = gui.addFolder('Debug')
  const debugNormals = debugFolder.add(debugParams, 'displayNormals').name('Apply normals?').listen()

  // listeners
  debugNormals.onChange(function (value) {
    if (PARAMS.displayNormals !== value) PARAMS.displayNormals = value // TODO works, but then cannot set it back!
  })
}

/** Reset parameters to default values */
const resetParameters = (current, defaults) => {
  if (!current || !defaults) return

  for (const key in current) current[key] = defaults[key]
}

/** Apply given parameters to canvas */
const updateCanvas = params => {
  resizeWindow(params['width'], params['height'])
  loadDefaultBackground()
}

/** Apply given parameters to the current model */
const updateModel = params => {
  PARAMS.angleX = params.angleX
  PARAMS.angleY = params.angleY
  PARAMS.angleZ = params.angleZ
  PARAMS.chanceToModifyScale = params.scaleChance
  PARAMS.scales[0] = params.scaleSmall
  PARAMS.scales[1] = params.scaleMed
  PARAMS.scales[2] = params.scaleBig
  setupSelectedModel()
}

/** Function used to update the camera in the scene after a change of parameters */
const applyCameraChanges = () => {
  // Updates the camera projection matrix. Must be called after any change of parameters.
  main.camera.updateProjectionMatrix()
}

/** Apply given parameters to the camera */
const updateCamera = params => {
  main.camera.aspect = params.aspect
  main.camera.fov = params.fov
  main.camera.position.x = params.positionX
  main.camera.position.y = params.positionY
  main.camera.position.z = params.positionZ
  applyCameraChanges()
}
