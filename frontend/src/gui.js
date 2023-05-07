import { main, resizeWindow, setBackground, PARAMS } from './script.js'

export const setupGUI = () => {
  // Once the dat.GUI library is loaded, you can access it via window.dat or simply dat
  if (dat && main.model && main.scene) {
    const gui = new dat.GUI()

    // Add Folder for Canvas settings
    const canvasFolder = gui.addFolder('Canvas')
    const canvas = main.renderer.domElement
    let canvasDefaults
    const canvasParams = {
      background: '#ffffff',
      width: PARAMS.width,
      height: PARAMS.height,
      useHDRLighting: PARAMS.useHDRLighting,
      randomBackground: PARAMS.randomBackground,
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
      setBackground(parseInt(value.slice(1), 16)) // #ffffff to 0xffffff (number)
    })
    canvasWidth.onChange(function (value) {
      resizeWindow(value, canvas.clientHeight)
    })
    canvasHeight.onChange(function (value) {
      resizeWindow(canvas.clientWidth, value)
    })
    canvasHDRLighting.onChange(function (value) {
      if (PARAMS.useHDRLighting !== value) PARAMS.useHDRLighting = value    // TODO: not working, maybe is setupEnvironment?
    })
    canvasRandomBackground.onChange(function (value) {
      if (PARAMS.randomBackground !== value) PARAMS.randomBackground = value
    })


    // Add Folder for Model settings
    const modelFolder = gui.addFolder('Model')
    let modelDefaults
    const modelParams = {
        angleX: PARAMS.angleX,
        angleY: PARAMS.angleY,
        angleZ: PARAMS.angleZ,
        scaleSmall: PARAMS.scales[0],
        scaleMed: PARAMS.scales[1], 
        scaleBig: PARAMS.scales[2],
        displayNormals: PARAMS.displayNormals,
      reset: () => {
        resetParameters(modelParams, modelDefaults)
        updateModel(modelParams)
      }
    }
    modelDefaults = Object.assign({}, modelParams)
    const modelAngleX = modelFolder.add(modelParams, 'angleX').min(0.0).max(1.0).listen()
    const modelAngleY = modelFolder.add(modelParams, 'angleY').min(0.0).max(1.0).listen()
    const modelAngleZ = modelFolder.add(modelParams, 'angleZ').min(0.0).max(1.0).listen()
    const modelScaleSmall = modelFolder.add(modelParams, 'scaleSmall').min(0.0).max(2.0).listen()
    const modelScaleMed = modelFolder.add(modelParams, 'scaleMed').min(0.0).max(3.0).listen()
    const modelScaleBig = modelFolder.add(modelParams, 'scaleBig').min(0.0).max(5.0).listen()
    const modelDisplayNormals = modelFolder.add(modelParams, 'displayNormals').name('Show normals?').listen()
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
    modelScaleSmall.onChange(function (value) {
        PARAMS.scales[0] = value
    })
    modelScaleMed.onChange(function (value) {
        PARAMS.scales[1] = value
    })
    modelScaleBig.onChange(function (value) {
        PARAMS.scales[2] = value
    })
    modelDisplayNormals.onChange(function (value) {
        if (PARAMS.displayNormals !== value) PARAMS.displayNormals = value  // TODO
      })


    // Add Folder for Camera settings
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
    cameraFolder.open()
    // listeners
    cameraAspect.onChange(function (value) {
      main.camera.aspect = value
      main.camera.updateProjectionMatrix()
    })
    cameraFov.onChange(function (value) {
      main.camera.fov = value
      main.camera.updateProjectionMatrix()
    })
    cameraX.onChange(function (value) {
      main.camera.position.x = value
      main.camera.updateProjectionMatrix()
    })
    cameraY.onChange(function (value) {
      main.camera.position.y = value
      main.camera.updateProjectionMatrix()
    })
    cameraZ.onChange(function (value) {
      main.camera.position.z = value
      main.camera.updateProjectionMatrix()
    })
  } else {
    console.error('dat.GUI library not loaded')
  }
}

/** Reset parameters to default values */
const resetParameters = (current, defaults) => {
  if (!current || !defaults) return

  for (const key in current) current[key] = defaults[key]
}

/** Apply given parameters to canvas */
const updateCanvas = params => {
  resizeWindow(params['width'], params['height'])
  console.log(PARAMS.defaultBackground)
  setBackground(PARAMS.defaultBackground); // TODO: fix: only the background is not being reset
}

const updateModel = params => {
}

/** Apply given parameters to camera */
const updateCamera = params => {
  main.camera.aspect = params.aspect
  main.camera.fov = params.fov
  main.camera.position.x = params.positionX
  main.camera.position.y = params.positionY
  main.camera.position.z = params.positionZ
  main.camera.updateProjectionMatrix()
}
