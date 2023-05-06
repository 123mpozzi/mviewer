import { main, resizeWindow, setBackground } from './script.js'


export const setupGUI = () => {
  // Once the dat.GUI library is loaded, you can access it via window.dat or simply dat
  if (dat && main.model && main.scene) {
    const gui = new dat.GUI()

    /*const cubeFolder = gui.addFolder('Controls')
        cubeFolder.add(model.rotation.y, '# Screenshots', 0, 999)
        cubeFolder.add(model.rotation.x, 'StartAngle', 0, Math.PI * 2)
        cubeFolder.add(model.rotation.y, 'updates', 0, 999)
        cubeFolder.add(model.rotation.z, '% change', 0, 100)
        cubeFolder.open()*/

    const canvasFolder = gui.addFolder('Canvas')
    const MIN_DIM = Math.min(window.innerWidth, window.innerHeight)
    const canvas = main.renderer.domElement
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const params = {
      background: '#ffffff'
    }
    const sizeParams = {
      width: canvas.clientWidth,
      height: canvas.clientHeight
    }
    canvasFolder.addColor(params, 'background').onChange(function (value) {
      setBackground(parseInt(value.slice(1), 16)) // #ffffff to 0xffffff (number)
    })
    const test = canvasFolder.add(sizeParams, 'width').min(100).max(window.innerWidth).listen();
    const testA = canvasFolder.add(sizeParams, 'height').min(100).max(window.innerHeight).listen();
    canvasFolder.open()

    test.onChange(function(value) 
	{   resizeWindow(value, canvas.clientHeight)   });
    testA.onChange(function(value) 
	{   resizeWindow(canvas.clientWidth, value)   });

    const LIMIT = 5
    const guiCameraControls = {
      get aspect () {
        return main.camera.aspect
      },
      set aspect (value) {
        main.camera.aspect = value
        main.camera.updateProjectionMatrix()
      },
      get fov () {
        return main.camera.fov
      },
      set fov (value) {
        main.camera.fov = value
        main.camera.updateProjectionMatrix()
      },
      get positionX () {
        return main.camera.position.x
      },
      set positionX (value) {
        main.camera.position.x = value
        main.camera.updateMatrixWorld()
      },
      get positionY () {
        return main.camera.position.y
      },
      set positionY (value) {
        main.camera.position.y = value
        main.camera.updateMatrixWorld()
      },
      get positionZ () {
        return main.camera.position.z
      },
      set positionZ (value) {
        main.camera.position.z = value
        main.camera.updateMatrixWorld()
      }
    }
    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(guiCameraControls, 'aspect', 0, 4)
    cameraFolder.add(guiCameraControls, 'fov', 0, 100)
    cameraFolder.add(guiCameraControls, 'positionX', -LIMIT, LIMIT)
    cameraFolder.add(guiCameraControls, 'positionY', -LIMIT, LIMIT)
    cameraFolder.add(guiCameraControls, 'positionZ', -LIMIT, LIMIT)
    cameraFolder.open()
  } else {
    console.error('dat.GUI library not loaded');
  }
}
