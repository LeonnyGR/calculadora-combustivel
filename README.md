# 🚗 Divide Fuel - Calculadora de Combustível

Aplicação Laravel + React para calcular custos de viagem considerando tipo de estrada e consumo do veículo.

## 🚀 Deploy Rápido

```bash
# 1. Configure os Secrets no GitHub (ver DEPLOY-SIMPLES.md)
# 2. Push para main
git push origin main

# 3. Acompanhe o deploy em Actions
# 4. Acesse: http://SEU_IP:8000
```

📖 **[Documentação Completa de Deploy](DEPLOY-SIMPLES.md)**

---

## ✨ Funcionalidades

- 🗺️ Cálculo de rota otimizada (OpenRouteService)
- 🚙 Dados reais de consumo por veículo
- ⛽ Diferencia consumo cidade vs rodovia
- 💰 Estimativa de custo total
- 📱 Interface responsiva (mobile + desktop)
- 💾 Histórico dos últimos 50 cálculos
- ✏️ Modo manual para veículos customizados

---

## 🛠️ Stack

**Backend:** Laravel 13, PHP 8.3, SQLite  
**Frontend:** React 19, Ant Design, Vite  
**Deploy:** Docker, Nginx, PHP-FPM, GitHub Actions

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
composer install
pnpm install

# Configurar .env
cp .env.example .env
php artisan key:generate

# Criar banco
touch database/database.sqlite
php artisan migrate

# Gerar rotas
php artisan wayfinder:generate

# Iniciar (em terminais separados)
php artisan serve
pnpm dev
```

Acesse: http://localhost:8000

---

## 📦 Estrutura de Deploy

```
/var/www/lgraiz/
├── deploy.sh           # Script automático de deploy
├── Dockerfile          # Imagem com Nginx + PHP-FPM
├── .env                # Configuração (apenas no VPS)
├── database/           # SQLite (persistido)
└── storage/            # Uploads e logs (persistido)
```

**Fluxo de Deploy:**
1. Push → GitHub Actions
2. rsync arquivos para VPS
3. `deploy.sh` builda imagem e sobe container
4. Executa migrations automaticamente

---

## 🔧 Comandos Úteis

```bash
# Ver logs
docker logs -f divide-fuel

# Executar artisan
docker exec divide-fuel php artisan cache:clear

# Rebuild manual
cd /var/www/lgraiz && ./deploy.sh

# Ver status
docker ps | grep divide-fuel
```

---

## 📝 Secrets Necessários (GitHub)

| Secret | Descrição |
|--------|-----------|
| `VPS_HOST` | IP do VPS |
| `VPS_USERNAME` | Usuário SSH |
| `VPS_SSH_KEY` | Chave SSH privada |

---

## 🐛 Troubleshooting

**Container não inicia:**
```bash
docker logs divide-fuel
```

**Erro APP_KEY:**
```bash
php artisan key:generate --show
# Adicionar ao .env no VPS
```

**Porta ocupada:**
```bash
# Editar deploy.sh e mudar PORT="8080"
```

---

## 📚 Documentação

- [Deploy Completo](DEPLOY-SIMPLES.md) - Guia passo-a-passo detalhado
- [Dockerfile](Dockerfile) - Configuração da imagem
- [deploy.sh](deploy.sh) - Script de deploy
- [GitHub Actions](.github/workflows/deploy.yml) - Pipeline CI/CD

---

## 📞 Suporte

🐛 Issues: https://github.com/seu-usuario/divide-fuel/issues

---

**Desenvolvido com ❤️ usando Laravel + React**
