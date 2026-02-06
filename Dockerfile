# Use a lightweight version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port your app runs on (usually 3000 or 5000)
EXPOSE 3000

# The default command to run your app
CMD ["npm", "start"]