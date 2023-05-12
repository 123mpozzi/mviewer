import { THREE, OrbitControls, PARAMS, main, setBackground, setupScene, applyNormals, enableScreensGUIs } from './script.js'

let clientId = Date.now()
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

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')

// Take and send a screenshot to the server
const takeScreenshot = (debug = false) => {
  // nScreens already taken: download
  if (counter >= PARAMS.nScreens) {
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

    // Reset screenshots button (previously unclickable during POST requests)
    PARAMS.takeScreens = false
    enableScreensGUIs()  // Re-enable the screenshot controller elements in the GUI
    counter = 0
    clientId = Date.now()  // reset id
    return
  } else {
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
        counter++
      })
      .catch(error => {
        console.log(error)
      })
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
      const newScale = PARAMS.scales[Math.floor(Math.random() * PARAMS.scales.length)]
      main.model.scale.set(newScale, newScale, newScale)
      PARAMS.count = 0
    }

    if (PARAMS.displayNormals) {
      applyNormals(main.model) // TODO: works, but then cannot set it back!
    }
  }

  // Modify background
  if (Math.random() < 0.5) {
    PARAMS.bg = Number(genRanHex(6))
  } else {
    // Use a texture
    // TODO: GET backgrounds from fastAPI and randomize
    const arr = ['sky.jpg', 'royal_esplanade_1k.hdr', 'abandoned_tiled_room_1k.hdr']
    PARAMS.bg = arr[Math.floor(Math.random() * arr.length)]
  }
  if (PARAMS.randomBackground) setBackground(PARAMS.bg)

  const arrZoom = [0.5, 1.0, 1.5]
  const zoom = arrZoom[Math.floor(Math.random() * arrZoom.length)]
  //camera.zoom = zoom;
  //camera.updateProjectionMatrix();

  requestAnimationFrame(animate)

  if (PARAMS.takeScreens) takeScreenshot()

  render()
}
