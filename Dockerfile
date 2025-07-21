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

# Instalar express
RUN npm init -y && npm install express

# Crear un servidor simple con Node.js
RUN echo 'const express = require("express");' > server.js && \
    echo 'const path = require("path");' >> server.js && \
    echo 'const app = express();' >> server.js && \
    echo '' >> server.js && \
    echo 'const PORT = process.env.PORT || 3000;' >> server.js && \
    echo '' >> server.js && \
    echo '// Servir archivos estáticos' >> server.js && \
    echo 'app.use(express.static(path.join(__dirname, "build")));' >> server.js && \
    echo '' >> server.js && \
    echo '// Manejar rutas de React Router' >> server.js && \
    echo 'app.get("*", (req, res) => {' >> server.js && \
    echo '  res.sendFile(path.join(__dirname, "build", "index.html"));' >> server.js && \
    echo '});' >> server.js && \
    echo '' >> server.js && \
    echo 'app.listen(PORT, "0.0.0.0", () => {' >> server.js && \
    echo '  console.log(`Server running on 0.0.0.0:${PORT}`);' >> server.js && \
    echo '});' >> server.js

# Copiar archivos build
COPY --from=build /app/build ./build

EXPOSE $PORT

CMD ["node", "server.js"]