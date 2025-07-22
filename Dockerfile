# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar build
COPY --from=build /app/build ./build

# Script de inicio mejorado
COPY <<EOF /app/start.sh
#!/bin/sh
PORT=\${PORT:-3000}
echo "Starting server on 0.0.0.0:\$PORT"
serve -s build -l \$PORT
EOF

RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]