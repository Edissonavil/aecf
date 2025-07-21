# ---------- Build Stage ----------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copia los archivos y depende de package-lock si lo tienes
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# Construye la aplicación para producción
RUN npm run build

# ---------- Serve Stage ----------
FROM nginx:stable-alpine

# Copia el archivo de configuración por defecto
COPY --from=build /app/build /usr/share/nginx/html

# Elimina la configuración por defecto y reemplázala (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto que Nginx usará
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

