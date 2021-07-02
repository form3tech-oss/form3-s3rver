FROM mhart/alpine-node

RUN mkdir -p form3-s3rver

WORKDIR form3-s3rver

COPY ./bin ./bin
COPY ./lib ./lib
COPY index.js package.json package-lock.json ./

RUN npm install && npm install -g
EXPOSE 5000
CMD [ "form3-s3rver" ]