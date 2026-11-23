# Stage 1: Build PHP dependencies and Frontend Assets
FROM dunglas/frankenphp:1-php8.4-alpine AS builder

# Install Node.js, npm, and PHP extensions required for build and Wayfinder
RUN apk add --no-cache nodejs npm \
    && install-php-extensions \
        pcntl \
        pdo_mysql \
        pdo_pgsql \
        pdo_sqlite \
        bcmath \
        zip \
        intl \
        opcache \
        redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy dependency definition files first for efficient caching
COPY composer.json composer.lock package*.json ./

# Install PHP dependencies without dev packages
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts

# Install npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Complete composer autoload and package discovery (required for artisan wayfinder:generate)
RUN composer dump-autoload --optimize

# Build frontend assets (now PHP and artisan are present for Wayfinder)
RUN npm run build

# Stage 2: Production Server
FROM dunglas/frankenphp:1-php8.4-alpine AS runner

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

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application from builder (including vendor/ and public/build/)
COPY --from=builder /app /app

# Remove node_modules to keep final image minimal
RUN rm -rf /app/node_modules

# Set up required directories and permissions
RUN mkdir -p database storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache database

# Entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/app/Caddyfile"]
