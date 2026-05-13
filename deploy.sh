#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# Variáveis
APP_DIR="/var/www/lgraiz"
CONTAINER_NAME="divide-fuel"
IMAGE_NAME="divide-fuel:latest"
PORT="8000"

cd $APP_DIR

# Parar e remover container antigo
echo "⏹️  Parando container antigo..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Buildar nova imagem
echo "🔨 Buildando imagem Docker..."
docker build -t $IMAGE_NAME .

# Executar novo container
echo "🚢 Subindo container..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:80 \
  -v $APP_DIR/.env:/var/www/html/.env:ro \
  -v $APP_DIR/database:/var/www/html/database \
  -v $APP_DIR/storage/app:/var/www/html/storage/app \
  -v $APP_DIR/storage/logs:/var/www/html/storage/logs \
  $IMAGE_NAME

# Aguardar container iniciar
echo "⏳ Aguardando container iniciar..."
sleep 5

# Executar migrations
echo "📦 Executando migrations..."
docker exec $CONTAINER_NAME php artisan migrate --force

# Limpar cache
echo "🧹 Limpando cache..."
docker exec $CONTAINER_NAME php artisan config:cache
docker exec $CONTAINER_NAME php artisan route:cache
docker exec $CONTAINER_NAME php artisan view:cache

# Limpar imagens antigas
echo "🗑️  Limpando imagens antigas..."
docker image prune -af

# Verificar status
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status do container:"
docker ps | grep $CONTAINER_NAME

echo ""
echo "🌐 Aplicação disponível em: http://localhost:$PORT"
echo ""
echo "📝 Ver logs:"
echo "   docker logs -f $CONTAINER_NAME"
