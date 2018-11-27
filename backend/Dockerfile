FROM node:11-alpine

WORKDIR /usr/app

COPY ./yarn.lock ./package.json /usr/app/

RUN yarn

EXPOSE 8080

CMD ["yarn", "start"]