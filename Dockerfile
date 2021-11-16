# syntax=docker/dockerfile:1

FROM node:16.13.0-alpine3.14

ENV NODE_ENV=production

WORKDIR /23bot

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]
