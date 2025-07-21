# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Serve Stage ----------
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Limpio y copro el build
RUN rm -rf ./*
COPY --from=build /app/build .

# Copio la plantilla de nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Exponemos 80 solo por convención, Railway usará $PORT
EXPOSE 80

# Al arrancar, envsubst-on-templates.sh generará default.conf en /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]
