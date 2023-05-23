import { THREE, OrbitControls, PARAMS, main, setBackground, setupScene, applyNormals, enableScreensGUIs, setupModel, udpateLighting } from './script.js'

/** Identifier of the current screenshot session */
let clientId = Date.now()
/** Counter of the screenshots in the current session */
let counter = 0

export const resizeWindow = (width, height) => {
  //const RAD2DEG = 114.59155902616465;
  //camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * RAD2DEG;
  //camera.position.z = 50;
  main.camera.aspect = window.innerWidth / window.innerHeight
  main.camera.updateProjectionMatrix()
  main.renderer.setSize(width, height)
}

export const init = () => {
  // HTML container element which will contain the generated canvas
  const container = document.createElement('div')
  document.body.appendChild(container)

  setupScene()
  setupRenderer()

  // Add canvas to HTML
  container.appendChild(main.renderer.domElement)

  // Allow the camera to orbit around a target
  const controls = new OrbitControls(main.camera, main.renderer.domElement)
  //controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 2
  controls.maxDistance = 10
  controls.target.set(0, 0, -0.2)
  controls.update()

  if (PARAMS.resizeToWindowSize)
    window.addEventListener('resize', () => {
      resizeWindow(this.innerWidth, this.innerHeight)
    })
}

/** Initialize the renderer and its drawing canvas */
const setupRenderer = () => {
  // Init renderer
  main.renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  })
  main.renderer.setPixelRatio(window.devicePixelRatio)

  // Set canvas size
  if (PARAMS.resizeToWindowSize) main.renderer.setSize(window.innerWidth, window.innerHeight)
  else resizeWindow(PARAMS.width, PARAMS.height)

  // for better rendering effects
  main.renderer.toneMapping = THREE.ACESFilmicToneMapping
  main.renderer.toneMappingExposure = 4
  main.renderer.outputColorSpace = THREE.SRGBColorSpace
}

/** Return a random element from the given array */
export const pickRandom = arr => {
  return arr[Math.floor(Math.random() * arr.length)]
};

/** Generate random hex color NUMBER, not string */
const genRanHex = () => {
  const n = (Math.random() * 0xfffff * 1000000).toString(16); //  toString(16) change the base to hex
  return parseInt(n.slice(0, 6), 16);  // 16 as radix for hex representation
};

/**
 * Reset the screenshots counter and other parameters to prepare for a new screenshot session
 */
const resetScreenshotSession = () => {
  // Reset screenshots button (previously unclickable during POST requests)
  PARAMS.takeScreens = false
  enableScreensGUIs()  // Re-enable the screenshot controller elements in the GUI
  counter = 0
  clientId = Date.now()  // reset id
  setupModel('shattered_glass.glb') // TODO: remove, it is just for testing
};

/**
 * Request and download the screenshots folder from the server
 */
const downloadScreenshotFolder = () => {
  let filename
  fetch('http://localhost:8000/api/zip/' + clientId, {
    method: 'GET'
  })  // Handle the FileResponse
    .then(res => {
      const disposition = res.headers.get('Content-Disposition')
      filename = disposition.split(/;(.+)/)[1].split(/=(.+)/)[1]
      if (filename.toLowerCase().startsWith("utf-8''"))
        filename = decodeURIComponent(filename.replace("utf-8''", ''))
      else filename = filename.replace(/['"]/g, '')
      return res.blob()
    })
    .then(blob => {
      var url = window.URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a) // append the element to the dom
      a.click()
      a.remove() // afterwards, remove the element
    })
    .catch(error => {
      console.log(error)
    })
};

/**
 * Shoot a screenshot of the current canvas, and upload it to the server
 * @param {*} debug whether to print canvas data (base64 format)
 */
const uploadScreenshot = (debug = false) => {
  const strMime = 'image/jpeg'

  // canvas to base64 img data string
  const imgData = main.renderer.domElement.toDataURL(strMime)
  if (debug) {
    console.log(
      JSON.stringify({
        input_data: imgData
      })
    )
  }

  // POST the base64 encoded canvas and the session identifier as JSON
  fetch('http://localhost:8000/api/screen/', {
    method: 'POST',
    body: JSON.stringify({
      input_data: imgData,
      folder_name: clientId
    }),
    headers: {
      contentType: 'application/json; charset=utf-8'
    }
  })
    .then(res => res.json())
    .then(data => {
      if (debug) {
        console.log(data)
        console.log(counter)
      }
      // increase screenshots counter
      counter++
    })
    .catch(error => {
      console.log(error)
    })
}

/**
 * Take a screenshot of the current canvas and send it to the server.  
 * If the screenshot counter is reached, instead, download the screenshots folder
 * @param {*} debug whether to debug the uploading data
 */
const takeScreenshot = (debug = false) => {
  // nScreens already taken: download
  if (counter >= PARAMS.nScreens) {
    downloadScreenshotFolder()
    resetScreenshotSession()
  } else {
    uploadScreenshot(debug)
  }
}

/**
 * Do a frame animation for the model.  
 * Assume the model exists
 */
const updateModel = () => {
  // Modify angle
  main.model.rotation.x += PARAMS.angleX
  main.model.rotation.y += PARAMS.angleY
  main.model.rotation.z += PARAMS.angleZ

  // Modify scale
  if (Math.random() < PARAMS.chanceToModifyScale) {
    const newScale = pickRandom(PARAMS.scales)
    main.model.scale.set(newScale, newScale, newScale)
  }

  // TODO: works, but then cannot set it back!
  if (PARAMS.displayNormals) applyNormals(main.model)
}

/**
 * Set the scene background to a uniform color
 * @param {*} color color to change the background to
 */
export const setBackgroundAsColor = (color) => {
  main.scene.background = new THREE.Color(color)
  udpateLighting()
}

/**
 * Do a frame animation for the background: change it randomly
 * @param {*} chanceToUseTexture chance to use a texture as background instead of a uniform color
 * @param {*} debug whether to print the randomly chosen uniform color
 */
const updateBackground = (chanceToUseTexture = 0.5, debug = false) => {
  // chance to pick a random uniform color as background
  if (Math.random() < chanceToUseTexture) {
    const randColor = genRanHex()
    if(debug) console.log(randColor)
    setBackgroundAsColor(randColor)
  } else {  // otherwise pick a texture
    setBackground(PARAMS.randomBackgroundGET)
  }
}

/** Render a static scene */
const render = () => {
  main.renderer.render(main.scene, main.camera)
}

/** Render a dynamic scene */
export const animate = () => {
  if (main.model) updateModel()
  if (PARAMS.randomBackground) updateBackground()

  // TODO: in future, could add controls for camera zoom level too
  //const arrZoom = [0.5, 1.0, 1.5]
  //const zoom = arrZoom[Math.floor(Math.random() * arrZoom.length)]
  //const zoom = pickRandom(arrZoom)
  //camera.zoom = zoom;
  //camera.updateProjectionMatrix();

  requestAnimationFrame(animate)

  if (PARAMS.takeScreens) takeScreenshot()

  render()
}
