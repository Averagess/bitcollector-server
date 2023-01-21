FROM node:18

WORKDIR /usr/src/server

COPY . .

RUN yarn

RUN yarn build

CMD [ "yarn", "start" ]