from fastapi import FastAPI, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import RedirectResponse, FileResponse

from traceback import print_exception
from pathlib import Path
import shutil, time, base64, json, os, random
import aiofiles


app = FastAPI()

DIR_SCREENS = '/data/out'
DIR_UPLOAD = '/data/uploads'
DIR_UPLOAD_MODELS =  os.path.join(DIR_UPLOAD, 'models')
DIR_UPLOAD_BACKGROUNDS = os.path.join(DIR_UPLOAD, 'backgrounds')
DIR_UPLOAD_BACKGROUNDS_ZIP = os.path.join(DIR_UPLOAD, 'backgrounds_zip')
INDEX = "/index.html"
DEFAULT_MODEL_PATH = './app/static/models/ring_gold_with_diamond.glb'
DEFAULT_BACKGROUND_PATH = './app/static/backgrounds/royal_esplanade_1k.hdr' # TODO: could use static files? like /static/..

allowed_ext_archives = ('.zip',)  # leave the comma to indicate Python that this is a tuple, not a str
allowed_ext_models = ('.glb',)
allowed_ext_environments = ('.hdr', '.hdri')
allowed_ext_images = ('.png', '.jpg', '.jpeg', '.gif', '.bmp')
allowed_extensions =  allowed_ext_archives + allowed_ext_models + allowed_ext_environments + allowed_ext_images

CHUNK_SIZE = 1024 * 1024  # adjust the chunk size as desired

# Setup CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

def debug(msg: str):
    print(msg, flush=True)

def createIfNotExist(path: str):
    Path(path).mkdir(parents=True, exist_ok=True)

def isModel(path: str):
    _, ext = os.path.splitext(path.lower())
    return os.path.isfile(path) and ext in allowed_ext_models

def isBackground(path: str):
    _, ext = os.path.splitext(path.lower())
    is_allowed = ext in allowed_ext_images or ext in allowed_ext_environments
    return os.path.isfile(path) and is_allowed

# Mount the dir "app/static" and assign it the name "static" to use internally
#app.mount("/static", StaticFiles(directory="app/static"), name="static")

# POST request to upload a file (either a model or a background)
# for info on UploadFile, see here: https://stackoverflow.com/a/70657621
@app.post("/uploader/")
async def create_upload_file(file: UploadFile = File(...)):
    try:
        _, extension = os.path.splitext(file.filename.lower())
        if extension not in allowed_extensions:
            return {"message": "File extension not supported"}
        
        unzip = False
        if extension in allowed_ext_archives:  # zip of backgrounds
            out_dir = DIR_UPLOAD_BACKGROUNDS_ZIP
            unzip = True
        elif extension in allowed_ext_models:  # model file
            out_dir = DIR_UPLOAD_MODELS
        else:  # background image
            out_dir = DIR_UPLOAD_BACKGROUNDS

        createIfNotExist(out_dir)
        out_file = os.path.join(out_dir, file.filename)
        async with aiofiles.open(out_file, 'wb') as f:
            while contents := await file.read(CHUNK_SIZE):
                await f.write(contents)
        
        if unzip:
            if os.path.exists(out_file):
                shutil.unpack_archive(out_file, DIR_UPLOAD_BACKGROUNDS, 'zip')
            else:
                return {"message": "There was an error finding the zip file"}
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error uploading the file"}
    finally:
        await file.close()
    return RedirectResponse(INDEX, status_code=303)

# POST request to upload a screenshot
@app.post("/screen/")
async def save_screenshot(post_data: str = Body(...)):
    try:
        # json.load is for files, json.loads is for strings!
        dictData = json.loads(post_data)
        # get data from JSON
        base64_image_str = dictData['input_data']
        folder_name = str(dictData['folder_name'])  # client identificator

        # remove POST data added to base64 (remove till comma included)
        base64_image_str = base64_image_str[base64_image_str.find(",")+1:]

        filename = str(time.time()) + '.jpeg'
        out_dir = os.path.join(DIR_SCREENS, folder_name)
        out_path = os.path.join(out_dir, filename)
        
        createIfNotExist(out_dir)
        
        # Write the screenshot to disk
        async with aiofiles.open(out_path, "wb") as f:
            await f.write(base64.decodebytes(base64_image_str.encode()))
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error uploading the file"}
    return {"filename": filename }

# GET request to zip and download a screenshots folder
@app.get("/zip/{folder_name}", response_class=FileResponse)
async def zip_folder(folder_name: str):
    try:
        out_dir = os.path.join(DIR_SCREENS, folder_name)
        if not os.path.isdir(out_dir):
            return { "message" : "Folder not found"}  # TODO: may cause problem with response_class as this is JSON object (dict). The issue is that there are multiple response types in this method

        out_zip = out_dir + '_archive'

        zip_name = shutil.make_archive(out_zip, format='zip', root_dir=out_dir)
        zip_name = os.path.join(out_dir, zip_name)
        
        response = FileResponse(path=zip_name, filename=zip_name)
        return response
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error archiving the files"}

# GET request to retrieve a model
@app.get("/models/{model_name}")
async def fetch_model(model_name: str):
    try:
        if model_name == "DEFAULT_MODEL":
            return FileResponse(path=DEFAULT_MODEL_PATH, filename=os.path.basename(DEFAULT_MODEL_PATH))

        model_path = os.path.join(DIR_UPLOAD_MODELS, model_name)
        if not isModel(model_path):
            return { "message" : "Model not found"}
        
        response = FileResponse(path=model_path, filename=model_name)
        return response
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error fetching the model"}

# GET request to retrieve a background
@app.get("/backgrounds/{bg_name}")
async def fetch_background(bg_name: str):
    try:
        if bg_name == "DEFAULT_BACKGROUND":
            return FileResponse(path=DEFAULT_BACKGROUND_PATH, filename=os.path.basename(DEFAULT_BACKGROUND_PATH))

        bg_path = os.path.join(DIR_UPLOAD_BACKGROUNDS, bg_name)
        if not isBackground(bg_path):
            return { "message" : "Background not found"}
        
        response = FileResponse(path=bg_path, filename=bg_name)
        return response
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error fetching the background"}

# GET request to retrieve a random background filename (str, not FileResponse)
@app.get("/randombg")
async def pick_background():
    try:
        if not os.path.isdir(DIR_UPLOAD_BACKGROUNDS) or len(os.listdir(DIR_UPLOAD_BACKGROUNDS)) == 0:
            return 'ERROR'
        
        bg_path = random.choice(os.listdir(DIR_UPLOAD_BACKGROUNDS))
        bg_path = os.path.join(DIR_UPLOAD_BACKGROUNDS, bg_path)
        if not isBackground(bg_path):
            return 'ERROR'
        
        return os.path.basename(bg_path)
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error fetching the background"}

# GET request to retrieve the list of names of available models
@app.get("/models")
async def list_models():
    try:
        if not os.path.isdir(DIR_UPLOAD_MODELS) or len(os.listdir(DIR_UPLOAD_MODELS)) == 0:
            return 'ERROR'
        
        return os.listdir(DIR_UPLOAD_MODELS)
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error listing the models"}

# TODO: could add Admin section in frontend which requests the cleanup of models, backgrounds, screenshots folders