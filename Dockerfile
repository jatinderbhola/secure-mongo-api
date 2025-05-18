FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Set environment variable
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
