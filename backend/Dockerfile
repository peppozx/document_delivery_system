FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads/documents uploads/temp logs

# Build TypeScript (for production)
# RUN npm run build

EXPOSE 3000

# Use dev mode by default (override in docker-compose)
CMD ["npm", "run", "dev"]
