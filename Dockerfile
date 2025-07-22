FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build

# Script de inicio mejorado
RUN echo "#!/bin/sh" > start.sh && \
    echo "PORT=\${PORT:-3000}" >> start.sh && \
    echo "echo \"Starting on port \$PORT\"" >> start.sh && \
    echo "serve -s build -l \$PORT" >> start.sh && \
    chmod +x start.sh

EXPOSE $PORT
CMD ["./start.sh"]