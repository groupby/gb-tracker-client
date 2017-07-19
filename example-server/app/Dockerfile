FROM node:8

MAINTAINER GroupByInc

RUN mkdir /app
WORKDIR /app

# Make sure to run `npm install` outside `docker build` so it's copied in with the COPY
# This is done becuase it's hard to `npm install` private packages inside docker build
COPY . /app

RUN npm install --production --silent

EXPOSE 8080

CMD ["node", "index.js"]