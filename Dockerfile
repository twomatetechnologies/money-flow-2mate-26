# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use Nginx to serve the application
FROM nginx:alpine

# Copy the built application
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Create a directory for persistent data
RUN mkdir -p /data
VOLUME /data

# Copy initialization and migration scripts
COPY ./init-container.sh /docker-entrypoint.d/40-init-container.sh
COPY ./migrate-postgres.sh /migrate-postgres.sh
RUN chmod +x /docker-entrypoint.d/40-init-container.sh /migrate-postgres.sh

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
