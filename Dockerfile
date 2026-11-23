# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production PHP Application Server (FrankenPHP)
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

ENV SERVER_NAME=":${PORT:-80}"
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

# Copy Composer binary
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Copy compiled frontend assets from frontend stage
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies without dev packages
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Set up required directories and permissions
RUN mkdir -p database storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache database

# Entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/app/Caddyfile"]
