import { main, resizeWindow, setBackground, PARAMS } from './script.js'


export const setupGUI = () => {
  // Once the dat.GUI library is loaded, you can access it via window.dat or simply dat
  if (dat && main.model && main.scene) {
    const gui = new dat.GUI()


    // Add Folder for Canvas settings
    const canvasFolder = gui.addFolder('Canvas')
    const canvas = main.renderer.domElement
    let canvasDefaults;
    const canvasParams = {
        background: '#ffffff',
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        reset: function() { resetCanvas(canvasParams, canvasDefaults) }
    }
    canvasDefaults = Object.assign({}, canvasParams);
    const canvasBackground = canvasFolder.addColor(canvasParams, 'background').listen();
    const canvasWidth = canvasFolder.add(canvasParams, 'width').min(100).max(window.innerWidth).listen();
    const canvasHeight = canvasFolder.add(canvasParams, 'height').min(100).max(window.innerHeight).listen();
    canvasFolder.add(canvasParams, 'reset').name("Reset Canvas");
    canvasFolder.open()
    // listeners
    canvasBackground.onChange(function (value) {
        setBackground(parseInt(value.slice(1), 16)) // #ffffff to 0xffffff (number)
      })
    canvasWidth.onChange(function(value) 
	{   resizeWindow(value, canvas.clientHeight)   });
    canvasHeight.onChange(function(value) 
	{   resizeWindow(canvas.clientWidth, value)   });


    // Add Folder for Camera settings
    const LIMIT = 5
    let cameraDefaults;
    const cameraParams = {
      aspect: main.camera.aspect,
      fov: main.camera.fov,
      positionX: main.camera.position.x,
      positionY: main.camera.position.y,
      positionZ: main.camera.position.z,
      reset: function() { resetCamera(cameraParams, cameraDefaults) }
    }
    cameraDefaults = Object.assign({}, cameraParams);
    const cameraFolder = gui.addFolder('Camera')
    const cameraAspect = cameraFolder.add(cameraParams, 'aspect', 0, 4).listen();
    const cameraFov = cameraFolder.add(cameraParams, 'fov', 0, 100).listen();
    const cameraX = cameraFolder.add(cameraParams, 'positionX', -LIMIT, LIMIT).listen();
    const cameraY = cameraFolder.add(cameraParams, 'positionY', -LIMIT, LIMIT).listen();
    const cameraZ = cameraFolder.add(cameraParams, 'positionZ', -LIMIT, LIMIT).listen();
    cameraFolder.add(cameraParams, 'reset').name("Reset Camera");
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
    console.error('dat.GUI library not loaded');
  }
}

const resetCanvas = (current, defaults) => {
    if(!current || !defaults)
        return;

    for(const key in current)
        current[key] = defaults[key];
    resizeWindow(current['width'], current['height'])
    console.log(PARAMS.defaultBackground)
    //setBackground(PARAMS.defaultBackground); // TODO: fix
};

const resetCamera = (current, defaults) => {
    if(!current || !defaults)
        return;

    for(const key in current)
        current[key] = defaults[key];
    
    main.camera.updateProjectionMatrix() // TODO: fix
};
