# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy health file if not already in dist
RUN cp /usr/share/nginx/html/health /usr/share/nginx/html/health || true
# Configure nginx to listen on port 3000 and handle SPA routing
RUN sed -i 's/listen  80;/listen 3000;/g' /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
