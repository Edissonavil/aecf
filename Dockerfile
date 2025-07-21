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

# Instalar serve
RUN npm install -g serve

# Copiar archivos
COPY --from=build /app/build ./build
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE $PORT

CMD ["/start.sh"]