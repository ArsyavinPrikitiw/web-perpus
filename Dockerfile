# Production PHP Application Server (FrankenPHP) with frontend build
FROM dunglas/frankenphp:1-php8.4-alpine AS runner

# Install necessary PHP extensions for Laravel
RUN install-php-extensions \
    pcntl \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    bcmath \
    zip \
    intl \
    opcache \
    redis

# Node is needed to build Vite assets (wayfinder requires PHP + vendor at build time)
RUN apk add --no-cache nodejs npm

ENV SERVER_NAME=":${PORT:-80}"
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

# Copy Composer binary
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Install PHP dependencies without dev packages
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Build frontend assets (php artisan is now available for wayfinder:generate)
RUN npm install && npm run build && rm -rf node_modules

# Set up required directories and permissions
RUN mkdir -p database storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache database

# Entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/app/Caddyfile"]
