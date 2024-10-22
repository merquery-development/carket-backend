# Use the official Node.js 20 Alpine image as a base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app


# Copy package.json and yarn.lock (or package-lock.json)
COPY package*.json yarn.lock ./

# Install dependencies using npm (or yarn if preferred)
RUN npm install
# Uncomment if you prefer Yarn
# RUN yarn install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npm run prisma generate

# Build the app (ensure your package.json has a build script)
RUN npm run build

# Start the server using the production build
CMD ["node", "dist/main.js"]
