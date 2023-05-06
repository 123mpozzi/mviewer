import {
  THREE,
  OrbitControls,
  PARAMS,
  main,
  setBackground,
  setupScene
} from './script.js'

const onWindowResize = () => {
  main.camera.aspect = window.innerWidth / window.innerHeight
  main.camera.updateProjectionMatrix()
  main.renderer.setSize(window.innerWidth, window.innerHeight)
}

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
    window.addEventListener('resize', onWindowResize)
}

const setupRenderer = () => {
  // Init renderer
  main.renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  })
  main.renderer.setPixelRatio(window.devicePixelRatio)

  // Set canvas size
  if (PARAMS.resizeToWindowSize)
    main.renderer.setSize(window.innerWidth, window.innerHeight)
  else resizeWindow(PARAMS.size, PARAMS.size)

  // for better rendering effects
  main.renderer.toneMapping = THREE.ACESFilmicToneMapping
  main.renderer.toneMappingExposure = 4
  main.renderer.outputEncoding = THREE.sRGBEncoding
}

const genRanHex = size =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')

// Take and send a screenshot to the server
// TODO: pack N screens and zip/pack them?
const takeScreenshot = () => {
  try {
    const debug = false
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

    fetch('http://localhost:8000/screen/', {
      method: 'POST',
      body: JSON.stringify({
        input_data: imgData
      }),
      headers: {
        contentType: 'application/json; charset=utf-8'
      }
    })
  } catch (e) {
    console.log(e)
    return
  }
}

const render = () => {
  main.renderer.render(main.scene, main.camera)
}

// Change Model angle, scale, and Scene background
export const animate = () => {
  if (main.model) {
    // modify angle
    main.model.rotation.x += PARAMS.angleX
    main.model.rotation.y += PARAMS.angleY
    main.model.rotation.z += PARAMS.angleZ

    // Modify scale only every n screenshots
    if (PARAMS.count > PARAMS.nScreens) {
      const newScale =
        PARAMS.scales[Math.floor(Math.random() * PARAMS.scales.length)]
      main.model.scale.set(newScale, newScale, newScale)
      PARAMS.count = 0
    }
  }

  // Modify background
  if (Math.random() < 0.5) {
    PARAMS.bg = Number(genRanHex(6))
  } else {
    // Use a texture
    // TODO: GET backgrounds from fastAPI and randomize
    const arr = [
      'sky.jpg',
      'royal_esplanade_1k.hdr',
      'abandoned_tiled_room_1k.hdr'
    ]
    PARAMS.bg = arr[Math.floor(Math.random() * arr.length)]
  }
  if (PARAMS.randomBackground) setBackground(PARAMS.bg)

  const arrZoom = [0.5, 1.0, 1.5]
  const zoom = arrZoom[Math.floor(Math.random() * arrZoom.length)]
  //camera.zoom = zoom;
  //camera.updateProjectionMatrix();

  requestAnimationFrame(animate)

  if (PARAMS.takeScreens && PARAMS.count < PARAMS.nScreens) takeScreenshot() // TODO: very fast, is right?

  PARAMS.count++
  render()
}
