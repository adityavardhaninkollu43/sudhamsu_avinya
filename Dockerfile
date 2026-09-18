# Readout Production Container
FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Run build step
RUN npm run build

# Port 3000 is required by the infrastructure
EXPOSE 3000

# Start custom server
CMD ["node", "server.js"]

