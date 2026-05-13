FROM php:8.4-fpm-alpine

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
RUN echo 'server { \n\
    listen 80; \n\
    server_name _; \n\
    root /var/www/html/public; \n\
    index index.php index.html; \n\
    \n\
    location / { \n\
        try_files $uri $uri/ /index.php?$query_string; \n\
    } \n\
    \n\
    location ~ \.php$ { \n\
        fastcgi_pass 127.0.0.1:9000; \n\
        fastcgi_index index.php; \n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \n\
        include fastcgi_params; \n\
    } \n\
    \n\
    location ~ /\.(?!well-known).* { \n\
        deny all; \n\
    } \n\
}' > /etc/nginx/http.d/default.conf

# Configuração do Supervisor (Nginx + PHP-FPM)
RUN echo '[supervisord] \n\
nodaemon=true \n\
user=root \n\
\n\
[program:php-fpm] \n\
command=php-fpm -F \n\
autostart=true \n\
autorestart=true \n\
stdout_logfile=/dev/stdout \n\
stdout_logfile_maxbytes=0 \n\
stderr_logfile=/dev/stderr \n\
stderr_logfile_maxbytes=0 \n\
\n\
[program:nginx] \n\
command=nginx -g "daemon off;" \n\
autostart=true \n\
autorestart=true \n\
stdout_logfile=/dev/stdout \n\
stdout_logfile_maxbytes=0 \n\
stderr_logfile=/dev/stderr \n\
stderr_logfile_maxbytes=0' > /etc/supervisord.conf

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

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
