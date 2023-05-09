import { THREE, GLTFLoader, DRACOLoader, RGBELoader, main, PARAMS, setupGUI, animate } from './script.js'

const loadFile = (file, manager) => {
  const filename = file.name
  const extension = filename.split('.').pop().toLowerCase()

  const reader = new FileReader()
  reader.addEventListener('progress', function (event) {
    const size = '(' + Math.floor(event.total / 1000).format() + ' KB)'
    const progress = Math.floor((event.loaded / event.total) * 100) + '%'

    console.log('Loading', filename, size, progress)
  })

  switch (extension) {
    /*case 'fbx': {
      reader.addEventListener(
        'load',
        async function (event) {
          const contents = event.target.result

          const { FBXLoader } = await import('../../examples/jsm/loaders/FBXLoader.js')

          const loader = new FBXLoader(manager)
          const object = loader.parse(contents)

          editor.execute(new AddObjectCommand(editor, object))
        },
        false
      )
      reader.readAsArrayBuffer(file)

      break
    }*/

    case 'glb': {
      reader.addEventListener(
        'load',
        async function (event) {
          const contents = event.target.result

          const dracoLoader = new DRACOLoader()
          dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/')

          const loader = new GLTFLoader()
          loader.setDRACOLoader(dracoLoader)
          loader.parse(contents, '', function (result) {
            const scene = result.scene
            scene.name = filename

            scene.animations.push(...result.animations)
            editor.execute(new AddObjectCommand(editor, scene))
          })
        },
        false
      )
      reader.readAsArrayBuffer(file)

      break
    }

    case 'gltf': {
      reader.addEventListener(
        'load',
        async function (event) {
          const contents = event.target.result

          let loader

          if (isGLTF1(contents)) {
            alert(
              'Import of glTF asset not possible. Only versions >= 2.0 are supported. Please try to upgrade the file to glTF 2.0 using glTF-Pipeline.'
            )
          } else {
            const dracoLoader = new DRACOLoader()
            dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/')

            loader = new GLTFLoader(manager)
            loader.setDRACOLoader(dracoLoader)
          }

          loader.parse(contents, '', function (result) {
            const scene = result.scene
            scene.name = filename

            scene.animations.push(...result.animations)
            editor.execute(new AddObjectCommand(editor, scene))
          })
        },
        false
      )
      reader.readAsArrayBuffer(file)

      break
    }

    /*case 'obj': {
      reader.addEventListener(
        'load',
        async function (event) {
          const contents = event.target.result

          const { OBJLoader } = await import('../../examples/jsm/loaders/OBJLoader.js')

          const object = new OBJLoader().parse(contents)
          object.name = filename

          editor.execute(new AddObjectCommand(editor, object))
        },
        false
      )
      reader.readAsText(file)

      break
    }

    case 'zip': {
      reader.addEventListener(
        'load',
        function (event) {
          handleZIP(event.target.result)
        },
        false
      )
      reader.readAsArrayBuffer(file)

      break
    }*/

    default:
      console.error('Unsupported file format (' + extension + ').')
      break
  }
}

// From https://github.com/mrdoob/three.js/blob/12204a5718c1872e95e402b49d4a45fdf1b55f0e/editor/js/Loader.js#L258-L289
const isGLTF1 = contents => {
  let resultContent

  if (typeof contents === 'string') {
    // contents is a JSON string
    resultContent = contents
  } else {
    const magic = THREE.LoaderUtils.decodeText(new Uint8Array(contents, 0, 4))

    if (magic === 'glTF') {
      // contents is a .glb file; extract the version
      const version = new DataView(contents).getUint32(4, true)

      return version < 2
    } else {
      // contents is a .gltf file
      resultContent = THREE.LoaderUtils.decodeText(new Uint8Array(contents))
    }
  }

  const json = JSON.parse(resultContent)

  // eslint-disable-next-line eqeqeq
  return json.asset != undefined && json.asset.version[0] < 2
}
