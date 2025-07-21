
#!/bin/sh

# Debug: mostrar todas las variables de entorno relacionadas con puerto
echo "=== DEBUG INFO ==="
echo "PORT variable: $PORT"
echo "All environment variables:"
env | grep -i port || echo "No PORT variables found"
echo "=================="

# Usar el puerto de Railway o 3000 por defecto
PORT=${PORT:-3000}
echo "Using port: $PORT"

# IMPORTANTE: serve debe escuchar en 0.0.0.0, no en localhost
echo "Starting server on 0.0.0.0:$PORT"
serve -s build --host 0.0.0.0 --port $PORT