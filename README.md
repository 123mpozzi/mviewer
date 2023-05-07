## Setup


Build the application via docker-compose:
`docker-compose up --build`

Now the application is running by default at:
`http://127.0.0.1:8080/index.html`




# -- Old

## Setup with Docker

Build the image:

`docker build -t lablab .`

Build and run a container:

`docker run -d --name contlablab -p 80:80 lablab`

## For use without docker, read README.md in `/app` folder
