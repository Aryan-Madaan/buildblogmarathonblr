
# Stage 1: Build the application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Set the API key from a build-time argument
# This will be passed by Cloud Build: --build-arg VITE_API_KEY=$VITE_API_KEY
ARG VITE_API_KEY
ENV VITE_API_KEY=$VITE_API_KEY

# Build the static files
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx page
RUN rm -rf ./*

# Copy static files from the build stage
COPY --from=build /app/dist .

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
