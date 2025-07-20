# Stage 1: Build the React App
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built app to Nginx's web root
COPY --from=builder /app/build /usr/share/nginx/html

# (Optional) Replace default Nginx config if using React Router or custom routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
