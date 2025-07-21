# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime Stage ----------
FROM node:18-alpine
WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar archivos build
COPY --from=build /app/build ./build

# Railway proporciona PORT automáticamente
EXPOSE $PORT

# serve automáticamente usa la variable de entorno PORT
CMD ["serve", "-s", "build"]