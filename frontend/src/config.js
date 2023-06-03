const BASE_URI = 'http://localhost:8000/api'

export const DEF_BG_NAME = 'DEFAULT_BACKGROUND'
export const DEF_MODEL_NAME = 'DEFAULT_MODEL'

export const config = {
  /** Base path for requesting to zip and download a screenshots folder, which name will be appended */
  downloadBasePOST: `${BASE_URI}/zip/`,
  /** Resource to upload a screenshot to the server */
  screenshotPOST: `${BASE_URI}/screen/`,
  /** Resource representing the default model to load into the scene */
  defaultModel: `${BASE_URI}/models/${DEF_MODEL_NAME}`,
  /** Resource representing the default background to load into the scene */
  defaultBackground: `${BASE_URI}/backgrounds/${DEF_BG_NAME}`,
  /** Resource to query to get the URI of a random background  */
  randomBackgroundGET: `${BASE_URI}/randombg`,
  /** Resource to query to get the list of available (uploaded) models */
  modelListGET: `${BASE_URI}/models`,
  /** Resource to upload files (either a model or backgrounds) to server */
  uploader: `${BASE_URI}/uploader/`,
};
