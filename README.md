# 3D Model Viewer for fine-tuning


Render 3D models in different environments, and catch lots of screenshot samples.  
The aim of this project is to help people improve their machine learning models.


## Setup


Build the application via docker-compose:
`docker-compose up --build`

Now the application should be running by default at:
`http://127.0.0.1:8000/index.html`


## Architecture

The backend is handled by FastAPI, while the frontend uses Three.js and is written in Javascript.  
Both are in separate Docker containers and docker-compose manages the linking.
