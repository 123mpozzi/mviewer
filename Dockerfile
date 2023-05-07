# syntax=docker/dockerfile:1

FROM python:3.8.10-slim-buster

WORKDIR /code

COPY ./backend/requirements.txt /code/backend/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/backend/requirements.txt

COPY ./backend/app /code/backend/app

WORKDIR /code/backend/app
CMD ["uvicorn", "main:app" , "--host", "0.0.0.0", "--port", "80", "--reload"]
