FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND yarn.lock are copied
COPY package*.json yarn.lock ./

RUN npm install yarn
# Install dependencies using Yarn
RUN yarn install

# Bundle app source
COPY . .

RUN yarn prisma generate
# Creates a "dist" folder with the production build
RUN yarn build

# Start the server using the production build
CMD ["node", "dist/main.js"]