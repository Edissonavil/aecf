
#!/bin/sh

# Usar el puerto proporcionado por Railway o 80 por defecto
PORT=${PORT:-80}

# Reemplazar el puerto en la configuración de nginx
sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf

echo "Starting nginx on port $PORT"

# Iniciar nginx
nginx -g "daemon off;"