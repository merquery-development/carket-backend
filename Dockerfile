# Base image
FROM node:20-alpine

RUN apk update && apk add yarn curl bash make && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json yarn.lock ./
COPY package*.json ./

# delete lock file to avoid conflicts
RUN rm yarn.lock



RUN yarn

# Bundle app source
COPY . .

RUN yarn prisma generate

RUN yarn build

EXPOSE 3000

# Start the server using the production build
CMD [ "node", "dist/main.js" ]