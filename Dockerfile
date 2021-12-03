FROM node:16 as builder
RUN npm install pm2 -g

WORKDIR /usr/src/

COPY . .

RUN mkdir -p /resources/sound

RUN npm ci

EXPOSE 3000
EXPOSE 4000
ENV HOST 0.0.0.0

ENV TOKEN ''
ENV CLIENTID ''
ENV NODE_ENV 'production'
VOLUME ["/usr/src/resources"]

ENTRYPOINT npm start