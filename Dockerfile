FROM php:8.4-fpm-alpine

# Alinhar UID/GID do www-data com o host Ubuntu (UID 33)
RUN deluser www-data 2>/dev/null || true && \
    delgroup www-data 2>/dev/null || true && \
    addgroup -g 33 -S www-data && \
    adduser -u 33 -D -S -G www-data www-data

# Instalar dependências do sistema e bibliotecas de desenvolvimento
RUN apk add --no-cache \
    nginx \
    supervisor \
    nodejs \
    npm \
    sqlite \
    sqlite-dev \
    curl \
    zip \
    unzip \
    oniguruma-dev

# Instalar extensões PHP
RUN docker-php-ext-install pdo_sqlite pdo_mysql mbstring

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /var/www/html

# Copiar código da aplicação
COPY . .

# Instalar dependências e buildar
RUN composer install --no-dev --optimize-autoloader && \
    pnpm install --ignore-scripts && \
    pnpm run build && \
    rm -rf node_modules

# Configuração do Nginx
COPY nginx-default.conf /etc/nginx/http.d/default.conf

# Configuração do Supervisor (Nginx + PHP-FPM)
COPY supervisord.conf /etc/supervisord.conf

CMD ["supervisord", "-c", "/etc/supervisord.conf"]

# Criar diretórios necessários
RUN mkdir -p storage/framework/{sessions,views,cache} \
    storage/logs \
    bootstrap/cache

# Ajustar permissões
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Otimizações do Laravel
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

EXPOSE 80

