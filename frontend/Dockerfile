# Build step #1: build the node front end
FROM node:lts-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json  ./
COPY index.html ./index.html
COPY ./src ./src
COPY ./public ./public
RUN npm install
RUN npm run build

# Build step #2: build a Caddy container
FROM caddy:alpine
EXPOSE 80
EXPOSE 443
COPY --from=build-step /app/dist /usr/share/caddy
