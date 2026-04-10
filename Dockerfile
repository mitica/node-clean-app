FROM node:22-alpine

# Set app directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl \
    wget \
    libc6-compat \
    gcompat

# Install app dependencies
COPY package*.json yarn.lock tsconfig*.json ./

RUN yarn

# Bundle app source
COPY . .

ENV NODE_ENV development

EXPOSE 3000

CMD ["yarn", "dev:server"]
