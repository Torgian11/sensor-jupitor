# Use an official Node image as a base
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy the package files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the content of the local src directory to the working directory
COPY . .

# Expose the port
EXPOSE 8080

# Run the command to start the development server
CMD ["npm", "run", "serve"]
