FROM node:16-alpine as BUILD_IMAGE

RUN apk update && apk add python3 python2 make g++ libtool autoconf automake && rm -rf /var/cache/apk/*

RUN npm install -g modclean

RUN npm install -g node-gyp

RUN npm config set python /usr/bin/python2

WORKDIR /usr/src/

COPY . .

RUN npm ci

RUN npm run build

RUN npm run prune

RUN modclean -n default:safe -r

WORKDIR /usr/src/bot

RUN modclean -n default:safe -r

WORKDIR /usr/src/front

RUN modclean -n default:safe -r

FROM node:16-alpine

RUN npm install pm2 -g

WORKDIR /usr/src/

COPY --from=BUILD_IMAGE /usr/src/ .

RUN mkdir -p /resources/sound

EXPOSE 3000
EXPOSE 4000
ENV HOST 0.0.0.0

ENV TOKEN ''
ENV CLIENTID ''
ENV NODE_ENV 'production'
VOLUME ["/usr/src/resources"]

ENTRYPOINT npm start