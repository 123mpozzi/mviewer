# Title

Using FastAPI and three.js

The aim of this project is to aid people in improving their machine learning models by providing a way to render 3D models in different environments, and catching a lot of screenshot samples.


## Setup

```bash
# Create the virtual environment
python -m venv venv

# and activate it
venv/scripts/activate

# now install the required packages
pip install -r ..\requirements.txt
```



## Running 

```bash
# Start the server:
uvicorn main:app --reload --port 8000

# Alternatively, use the preincluded start script
cd app
./start.cmd
```

Finally, open the browser to the given address from the terminal window, and append `static/index.html` to go to the main page.  
For example: `http://127.0.0.1:8000/static/index.html`



## Manage app

to upload a model, add it to the "app/static/models" folder and rename it to "ring_gold_with_diamond.glb", which is the default model loaded (or change it in the code in app/static/script.js at line 187)

To take screenshots: 
edit the file "app/static/script.js" at line 16, set applyScreens = true, and set also the amount to take with nScreens at line 17.
Screens will be saved in app/out folder
(I think that it is actually bugged and will keep taking backgrounds over nScreens, but that may be useful for finetuning)

To change background at each frame, uncomment line 285

If you want to add textures (images like jpg) backgrounds, you have to add them to the app/static/backgrounds folder and also in the code append them to the array at line 282 like this: const arr = ['sky.jpg', 'royal_esplanade_1k.hdr', 'abandoned_tiled_room_1k.hdr', 'newly_added_background.png'];

To remove the GUI: remove the inside of setupGUI()

By default, every nScreens rotations (even if applyScreens is off), the model will change scale, you can change the scales too at the start of the files, at line 15


