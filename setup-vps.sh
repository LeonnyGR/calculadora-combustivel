#!/bin/bash
# Script de setup inicial no VPS
# Execute este script apenas UMA VEZ no servidor

set -e

echo "🔧 Setup inicial do Divide Fuel no VPS"
echo ""

# Verificar se está rodando no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo "❌ Erro: Execute este script dentro de /var/www/lgraiz"
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "📦 Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    echo "✅ Docker instalado"
else
    echo "✅ Docker já está instalado"
fi

# Criar .env se não existir
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Criando arquivo .env..."
    
    read -p "Digite o IP ou domínio do servidor (ex: 123.456.789.0): " SERVER_HOST
    read -p "Digite a porta da aplicação (padrão: 8000): " APP_PORT
    APP_PORT=${APP_PORT:-8000}
    
    cat > .env << EOF
APP_NAME="Calculadora de Combustível"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://${SERVER_HOST}:${APP_PORT}

DB_CONNECTION=sqlite

CACHE_DRIVER=file
SESSION_DRIVER=database
QUEUE_CONNECTION=database
LOG_LEVEL=error

SESSION_LIFETIME=120
EOF

    echo "✅ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: É necessário gerar o APP_KEY"
    echo "   Execute localmente: php artisan key:generate --show"
    echo "   E adicione ao arquivo .env"
    echo ""
else
    echo "✅ Arquivo .env já existe"
fi

# Criar banco de dados
if [ ! -f "database/database.sqlite" ]; then
    echo "📦 Criando banco de dados SQLite..."
    mkdir -p database
    touch database/database.sqlite
    echo "✅ Banco criado"
else
    echo "✅ Banco de dados já existe"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p storage/app/public
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Ajustar permissões
echo "🔒 Ajustando permissões..."
chmod -R 775 storage bootstrap/cache
echo "✅ Permissões ajustadas"

# Verificar firewall
echo ""
echo "🔥 Configuração do Firewall"
if command -v ufw &> /dev/null; then
    read -p "Deseja abrir a porta ${APP_PORT} no firewall? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sudo ufw allow ${APP_PORT}
        echo "✅ Porta ${APP_PORT} aberta no firewall"
    fi
else
    echo "⚠️  UFW não encontrado. Configure o firewall manualmente."
fi

echo ""
echo "✅ Setup inicial concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Gere o APP_KEY e adicione ao .env"
echo "   2. Configure os Secrets no GitHub (VPS_HOST, VPS_USERNAME, VPS_SSH_KEY)"
echo "   3. Faça push para main: git push origin main"
echo "   4. O GitHub Actions fará o deploy automaticamente"
echo ""
echo "   OU execute manualmente:"
echo "   ./deploy.sh"
echo ""
