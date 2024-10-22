# Step 1: Use a Node.js base image
FROM node:20-alpine AS build

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --only=production

# Step 5: Copy the rest of the application source code to the working directory
COPY . .

# Step 6: Build the NestJS application
RUN npm run prisma generate

RUN npm run build

# Step 8: Set the working directory in the production container
WORKDIR /app

# Step 9: Copy the built application and node_modules from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Step 10: Set the environment variables (optional)
ENV PORT=3000

# Step 11: Expose the port the NestJS app will run on
EXPOSE 3000

# Step 12: Define the command to run the application
CMD ["node", "dist/main"]

