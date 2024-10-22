# Base image
FROM node:20-alpine

RUN apk update && apk add yarn curl bash make && rm -rf /var/cache/apk/*

RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./


RUN yarn

RUN yarn prisma generate

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]