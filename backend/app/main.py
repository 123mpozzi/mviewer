from fastapi import FastAPI, File, UploadFile, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import RedirectResponse

from traceback import print_exception
from pathlib import Path
import shutil, time, base64, json, os


app = FastAPI()

DIR_SCREENS = '/data/out'
DIR_UPLOAD = '/data/uploads'

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

def createIfNotExist(path: str):
    Path(path).mkdir(parents=True, exist_ok=True)

# Mount the dir "app/static" and assign it the name "static" to use internally
#app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.post("/uploader/")
async def create_upload_file(file: UploadFile = File(...)):
    createIfNotExist(DIR_UPLOAD)
    with open(os.path.join(DIR_UPLOAD, file.filename), "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    #return {"filename": file.filename}
    # redirect to index
    return RedirectResponse("/index.html", status_code=303)

@app.post("/screen/")
async def save_screenshot(post_data: str = Body(...)):
    try:
        # json.load is for files, json.loads is for strings!
        dictData = json.loads(post_data)
        # get data from JSON
        base64_image_str = dictData['input_data']
        download_request = dictData['download_request']
        folder_name = str(dictData['folder_name'])

        # remove POST data added to base64 (remove till comma included)
        base64_image_str = base64_image_str[base64_image_str.find(",")+1:]

        filename = str(time.time()) + '.jpeg'
        out_dir = os.path.join(DIR_SCREENS, folder_name)
        out_path = os.path.join(out_dir, filename)
        
        createIfNotExist(out_dir)

        # if the client request a download: archive the folder and POST it
        if download_request:
            # root and base dir declared like this to leave a dir inside the zip
            zip_name = shutil.make_archive(f'archive_{out_dir}', format='zip', root_dir=out_dir)
            # zip_name = shutil.make_archive(f'archive_{out_dir}', format='zip', root_dir='.', base_dir=out_dir)
            return { "archive": zip_name }
        
        # Write the screenshot to disk
        with open(out_path, "wb") as f:
            f.write(base64.decodebytes(base64_image_str.encode()))
    except Exception as e:
        print_exception(e)
        return {"message": "There was an error uploading the file"}
    return {"filename": filename }
