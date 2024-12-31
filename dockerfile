# Frontend Dockerfile
FROM node:20


COPY ./common/types.ts ./common/types.ts
COPY . .

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application and shared types
COPY . .

# Expose the port for the frontend
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "dev"]
