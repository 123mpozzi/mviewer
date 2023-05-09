from fastapi import FastAPI, File, UploadFile, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import RedirectResponse

from pathlib import Path
import shutil, time, base64, json


app = FastAPI()


# Setup CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the dir "app/static" and assign it the name "static" to use internally
#app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.post("/uploader/")
async def create_upload_file(file: UploadFile = File(...)):
    DIR_UPLOAD = 'uploads'
    Path(f"/{DIR_UPLOAD}").mkdir(parents=True, exist_ok=True)
    with open(f"{DIR_UPLOAD}/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    #return {"filename": file.filename}
    # redirect to index
    return RedirectResponse("/index.html", status_code=303)

@app.post("/screen/")
async def save_screenshot(input_data: str = Body(...)):
    try:
        # json.load is for files, json.loads is for strings!
        dictData = json.loads(input_data)
        base64_image_str = dictData['input_data']
        # remove POST data added to base64 (remove till comma included)
        base64_image_str = base64_image_str[base64_image_str.find(",")+1:]

        filename = str(time.time()) + '.png'

        DIR_SCREENS = 'out'
        Path(f"/{DIR_SCREENS}").mkdir(parents=True, exist_ok=True)
        with open(f"{DIR_SCREENS}/{filename}", "wb") as f:
            f.write(base64.decodebytes(base64_image_str.encode()))
    except Exception:
        return {"message": "There was an error uploading the file"}
    return {"filename": filename }
