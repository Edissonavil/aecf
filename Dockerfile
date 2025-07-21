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

# Limpio el contenido default y copio el build
RUN rm -rf ./*
COPY --from=build /app/build .

# Copio mi config de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Le indico a Railway que use el PORT que le pase (o el 80 si no hay)
ARG PORT=80
ENV PORT $PORT
EXPOSE $PORT

CMD ["nginx", "-g", "daemon off;"]
