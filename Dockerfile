# frontend/Dockerfile
# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Serve Stage ----------
FROM nginx:stable-alpine

# Limpia la carpeta y copia el build
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .

# Copia la plantilla en lugar de conf fija
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Exponer 80 por convención (Railway usará $PORT)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
