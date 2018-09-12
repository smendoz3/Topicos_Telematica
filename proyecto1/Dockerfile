FROM node:9.6.1

LABEL version="1.0"
LABEL description="Proyecto1 NodeJS"
LABEL maintainer="David Benitez - Efrain Gonzalez - Santiago Mendoza"

ARG PORT=3000
ENV PORT $PORT

WORKDIR /proyecto1
COPY . ./

RUN npm install --test

EXPOSE 3000
CMD npm start