FROM node:11-alpine

WORKDIR /usr/app

COPY ./yarn.lock ./package.json /usr/app/

RUN yarn

EXPOSE 3000

CMD ["yarn", "start"]