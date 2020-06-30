FROM node:12-alpine

ENV AWS_ACCESS_KEY_ID=S3RVER \
    AWS_SECRET_ACCESS_KEY=S3RVER

RUN mkdir -p form3-s3rver

WORKDIR form3-s3rver

COPY ./bin ./bin
COPY ./lib ./lib
COPY index.js package.json package-lock.json ./

RUN npm install && npm install -g
EXPOSE 5000
CMD [ "form3-s3rver" ]
