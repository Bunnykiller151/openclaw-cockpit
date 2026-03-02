FROM node:18-slim

# Install Python and build tools for node-pty
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set Python for node-gyp
ENV PYTHON=/usr/bin/python3

# Set workspace environment
ENV WORKSPACE_ROOT=/app

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install for flexibility with updated deps)
RUN npm install

# Copy app files
COPY . .

# Railway provides PORT env var dynamically
# Our server listens on process.env.PORT || 3000
# Start server
CMD ["npm", "start"]
