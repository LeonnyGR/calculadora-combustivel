# 🚀 Deploy Automático com GitHub Actions

## ⚙️ Como Funciona

1. **Push para `main`** → GitHub Actions é acionado
2. **GitHub Actions** → Envia arquivos via rsync para `/var/www/lgraiz`
3. **Script `deploy.sh`** → Executa automaticamente no VPS:
   - Para container antigo
   - Builda nova imagem Docker
   - Sobe container na porta 8000
   - Executa migrations
   - Limpa imagens antigas

---

## 📋 Setup Inicial (Uma vez apenas)

### 1. Preparar VPS

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Criar diretório
sudo mkdir -p /var/www/lgraiz
sudo chown -R $USER:$USER /var/www/lgraiz
cd /var/www/lgraiz
```

### 2. Configurar .env no VPS

```bash
cd /var/www/lgraiz

cat > .env << 'EOF'
APP_NAME="Calculadora de Combustível"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://SEU_IP:8000

DB_CONNECTION=sqlite

CACHE_DRIVER=file
SESSION_DRIVER=database
QUEUE_CONNECTION=database
LOG_LEVEL=error
EOF

# Gerar APP_KEY (executar localmente e copiar)
# php artisan key:generate --show
# Depois adicione ao .env acima
```

### 3. Criar banco de dados

```bash
mkdir -p database
touch database/database.sqlite
```

### 4. Configurar GitHub Secrets

No GitHub, vá em: **Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `VPS_HOST` | `123.456.789.0` | IP do seu VPS |
| `VPS_USERNAME` | `root` ou `ubuntu` | Usuário SSH |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH...` | Sua chave SSH privada completa |

**Como obter a chave SSH:**

```bash
# No seu computador, ver a chave privada
cat ~/.ssh/id_rsa

# Ou gerar uma nova
ssh-keygen -t rsa -b 4096 -C "deploy@github"
cat ~/.ssh/id_rsa

# Adicionar chave pública no VPS
ssh-copy-id usuario@SEU_VPS_IP
# OU manualmente:
cat ~/.ssh/id_rsa.pub | ssh usuario@SEU_VPS_IP "cat >> ~/.ssh/authorized_keys"
```

### 5. Abrir porta no firewall

```bash
# No VPS
sudo ufw allow 8000
sudo ufw status
```

---

## 🚀 Fazer Deploy

Agora é só fazer push para o repositório:

```bash
git add .
git commit -m "Deploy"
git push origin main
```

**O GitHub Actions vai automaticamente**:
1. ✅ Enviar arquivos para `/var/www/lgraiz`
2. ✅ Executar `deploy.sh` no VPS
3. ✅ Buildar imagem Docker
4. ✅ Subir container na porta 8000
5. ✅ Executar migrations

Acompanhe o progresso em: **Actions** no GitHub

Acesse: `http://SEU_IP:8000`

---

## 🔄 Atualizações Futuras

Basta fazer push para `main`:

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

O deploy é 100% automático! 🎉

---

## 🛠️ Comandos Úteis no VPS

```bash
# Ver logs do container
docker logs -f divide-fuel

# Ver status
docker ps

# Parar container
docker stop divide-fuel

# Iniciar container
docker start divide-fuel

# Entrar no container
docker exec -it divide-fuel sh

# Executar artisan
docker exec divide-fuel php artisan cache:clear
docker exec divide-fuel php artisan migrate

# Rebuild manual (se necessário)
cd /var/www/lgraiz
./deploy.sh

# Ver logs do Laravel
docker exec divide-fuel tail -f /var/www/html/storage/logs/laravel.log
```

---

## 📊 Monitoramento

```bash
# Ver uso de recursos
docker stats divide-fuel

# Health check
curl http://localhost:8000

# Ver todas as imagens
docker images

# Ver todos os containers
docker ps -a
```

---

## 🐛 Troubleshooting

### Deploy falha no GitHub Actions

```bash
# Verificar secrets no GitHub
# Testar SSH manualmente:
ssh -i ~/.ssh/id_rsa usuario@SEU_VPS_IP
```

### Container não inicia

```bash
# Ver logs
docker logs divide-fuel

# Ver erro específico
docker inspect divide-fuel
```

### Erro de permissões

```bash
cd /var/www/lgraiz
docker exec divide-fuel chown -R www-data:www-data /var/www/html/storage
docker exec divide-fuel chmod -R 775 /var/www/html/storage
```

### Erro "APP_KEY not set"

```bash
# Gerar localmente
php artisan key:generate --show

# Adicionar ao .env no VPS
nano /var/www/lgraiz/.env
```

### Porta 8000 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :8000

# Editar deploy.sh para usar outra porta
nano /var/www/lgraiz/deploy.sh
# Mudar: PORT="8080"
```

### Limpar tudo e recomeçar

```bash
cd /var/www/lgraiz
docker stop divide-fuel
docker rm divide-fuel
docker rmi divide-fuel:latest
./deploy.sh
```

---

## 📦 Backup

```bash
# Backup do banco de dados
cd /var/www/lgraiz
tar -czf backup-$(date +%Y%m%d).tar.gz database/ storage/

# Restaurar backup
tar -xzf backup-YYYYMMDD.tar.gz
```

---

## 🔒 Segurança

1. **Nunca commite o .env** - Já está no .gitignore
2. **Use HTTPS** - Configure um proxy reverso (nginx) com Let's Encrypt
3. **Firewall** - Apenas portas necessárias abertas
4. **Backups regulares** - Configure cronjob para backups automáticos
5. **Atualize o sistema** - `sudo apt update && sudo apt upgrade`

---

## 📁 Estrutura no VPS

```
/var/www/lgraiz/
├── .env                      # Configuração (NÃO vem do Git)
├── deploy.sh                # Script de deploy (vem do Git)
├── Dockerfile               # Vem do Git
├── database/
│   └── database.sqlite      # Persistido (não sobrescrito)
├── storage/
│   ├── app/                 # Persistido (uploads)
│   └── logs/                # Persistido (logs)
└── ... (resto do código)    # Atualizado a cada deploy
```

---

## 🚦 Status de Deploy

Você pode ver o status do deploy em tempo real:

1. Acesse seu repositório no GitHub
2. Clique na aba **Actions**
3. Veja o workflow "Deploy to VPS" executando

---

## ⚡ Performance

O container usa:
- **Nginx** como web server (rápido e leve)
- **PHP-FPM** para processar PHP (otimizado)
- **Supervisor** para gerenciar processos
- **OPcache** habilitado no PHP
- **Assets buildados** com Vite (otimizados)

---

## 📝 Checklist

- [ ] Docker instalado no VPS
- [ ] Diretório `/var/www/lgraiz` criado
- [ ] `.env` configurado no VPS
- [ ] `APP_KEY` gerada
- [ ] Banco SQLite criado
- [ ] Secrets configurados no GitHub
- [ ] SSH funcionando
- [ ] Porta 8000 aberta no firewall
- [ ] Primeiro deploy executado
- [ ] Aplicação acessível

---

## 🎉 Pronto!

Agora a cada push para `main`, sua aplicação é automaticamente deployada!

**Próximos passos recomendados:**
- Configure um domínio
- Configure HTTPS com Let's Encrypt
- Configure backups automáticos
- Configure monitoramento (uptime, alertas)


## Passo 3: Criar .env no VPS

```bash
cd /var/www/lgraiz

# Criar .env
cat > .env << 'EOF'
APP_NAME="Calculadora de Combustível"
APP_ENV=production
APP_KEY=base64:GERE_UMA_CHAVE_AQUI
APP_DEBUG=false
APP_URL=http://SEU_IP:8000

DB_CONNECTION=sqlite

CACHE_DRIVER=file
SESSION_DRIVER=database
QUEUE_CONNECTION=database
EOF

# IMPORTANTE: Gerar APP_KEY
# Você pode gerar localmente e copiar:
# php artisan key:generate --show
```

## Passo 4: Criar banco SQLite

```bash
touch database/database.sqlite
```

## Passo 5: Buildar imagem

```bash
cd /var/www/lgraiz
docker build -t divide-fuel:latest .
```

## Passo 6: Executar container

```bash
# Parar container antigo (se existir)
docker stop divide-fuel 2>/dev/null
docker rm divide-fuel 2>/dev/null

# Executar novo container
docker run -d \
  --name divide-fuel \
  --restart unless-stopped \
  -p 8000:80 \
  -v /var/www/lgraiz/.env:/var/www/html/.env \
  -v /var/www/lgraiz/database:/var/www/html/database \
  -v /var/www/lgraiz/storage:/var/www/html/storage \
  divide-fuel:latest

# Ver logs
docker logs -f divide-fuel
```

## Passo 7: Executar migrations

```bash
# Primeira vez apenas
docker exec divide-fuel php artisan migrate --force
```

## Passo 8: Acessar

Acesse: `http://SEU_IP:8000`

---

## 🔄 Atualizar aplicação

```bash
cd /var/www/lgraiz

# Parar container
docker stop divide-fuel

# Atualizar código (via Git ou upload)
git pull origin main
# OU extrair novo tar.gz

# Rebuildar imagem
docker build -t divide-fuel:latest .

# Executar novo container
docker rm divide-fuel
docker run -d \
  --name divide-fuel \
  --restart unless-stopped \
  -p 8000:80 \
  -v /var/www/lgraiz/.env:/var/www/html/.env \
  -v /var/www/lgraiz/database:/var/www/html/database \
  -v /var/www/lgraiz/storage:/var/www/html/storage \
  divide-fuel:latest

# Ver se está rodando
docker ps
docker logs divide-fuel
```

---

## 🛠️ Comandos Úteis

```bash
# Ver containers rodando
docker ps

# Ver logs
docker logs -f divide-fuel

# Entrar no container
docker exec -it divide-fuel sh

# Executar artisan
docker exec divide-fuel php artisan cache:clear
docker exec divide-fuel php artisan config:cache

# Parar
docker stop divide-fuel

# Iniciar
docker start divide-fuel

# Remover
docker rm -f divide-fuel

# Ver imagens
docker images

# Limpar imagens antigas
docker image prune -a
```

---

## 📦 Estrutura no VPS

```
/var/www/lgraiz/
├── .env                    # Configuração (NÃO commitado)
├── database/
│   └── database.sqlite    # Banco de dados (persistido)
├── storage/               # Uploads e logs (persistido)
├── Dockerfile
└── ... (resto do código)
```

---

## 🔒 Firewall

```bash
# Permitir porta 8000
sudo ufw allow 8000
sudo ufw status
```

---

## ⚠️ Importante

1. **Sempre gere o APP_KEY** antes de rodar
2. **Não commite o .env** no Git
3. **Use volumes** para persistir banco e storage
4. **Rebuild** a imagem após mudanças no código
5. **Backup** do database.sqlite regularmente

---

## 🆘 Troubleshooting

**Container não inicia:**
```bash
docker logs divide-fuel
```

**Erro de permissões:**
```bash
docker exec divide-fuel chown -R www-data:www-data /var/www/html/storage
```

**Porta ocupada:**
```bash
# Usar outra porta (ex: 8080)
docker run -p 8080:80 ...
```

**Limpar tudo:**
```bash
docker rm -f divide-fuel
docker rmi divide-fuel:latest
```
