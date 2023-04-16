from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


app = FastAPI()


app.mount("/static", StaticFiles(directory="static"), name="static")
#app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


# to get https://example.com/items/foo would be app.get(/items/foo)
#@app.get("/") # GET operation
#async def root():
#    return {"message": "Hello World"}
