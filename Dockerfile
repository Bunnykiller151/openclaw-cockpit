FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (schnell, nur JS)
RUN npm install

# Copy app files
COPY . .

# Start server
CMD ["npm", "start"]
