from fastapi import FastAPI, File, UploadFile, Request, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
#from routers import upload, twoforms, unsplash, accordion

from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from typing import Dict
import shutil, time, base64, json


app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")
@app.get("/upload/", response_class=HTMLResponse)
async def upload(request: Request):
   return templates.TemplateResponse("uploadfile.html", {"request": request})

@app.post("/uploader/")
async def create_upload_file(file: UploadFile = File(...)):
    with open(f"static/models/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename}

@app.post("/screen/")
async def save_screenshot(input_data: str = Body(...)):
    try:
        # json.load is for files, json.loads is for strings!
        dictData = json.loads(input_data)
        base64_image_str = dictData['input_data']
        # remove POST data added to base64 (remove till comma included)
        base64_image_str = base64_image_str[base64_image_str.find(",")+1:]

        filename = str(time.time()) + '.png'
        with open(f"out/{filename}", "wb") as f:
            f.write(base64.decodebytes(base64_image_str.encode()))
    except Exception:
        return {"message": "There was an error uploading the file"}
    return {"filename": filename }

#app.include_router(upload.router)

# to get https://example.com/items/foo would be app.get(/items/foo)
#@app.get("/") # GET operation
#async def root():
#    return {"message": "Hello World"}
