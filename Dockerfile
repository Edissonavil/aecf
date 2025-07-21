# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime Stage ----------
FROM nginx:stable-alpine

# Copia tu carpeta build al html root
COPY --from=build /app/build /usr/share/nginx/html

# Copia la configuración de nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Railway asigna el puerto dinámicamente
EXPOSE $PORT

# Script para iniciar nginx con el puerto correcto
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
