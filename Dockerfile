FROM node:21.7.2-alpine

# Set app directory
WORKDIR /usr/src/app

# Install git in order to allow installing
# npm packages from Github
RUN set -xe \
    && apk add --no-cache git

RUN apk update && apk add --no-cache \
    bash \
    curl \
    wget \
    libc6-compat \
    gcompat

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./
COPY tsconfig*.json ./

RUN yarn

# Bundle app source
COPY . .

ENV NODE_ENV development

EXPOSE 8000

CMD ["yarn","start-inside-docker"]
