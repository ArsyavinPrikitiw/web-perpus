#!/bin/sh
set -e

# Ensure SQLite file exists if using SQLite connection
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    mkdir -p /app/database
    touch /app/database/database.sqlite
fi

# Ensure storage directories exist with write permissions
mkdir -p /app/storage/framework/cache/data /app/storage/framework/sessions /app/storage/framework/views /app/storage/logs /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache /app/database 2>/dev/null || true

# Run database migrations
if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force --no-interaction || true
fi

# Create storage symbolic link
php artisan storage:link || true

# Cache config, routes, and views if APP_KEY is provided
if [ -n "$APP_KEY" ]; then
    echo "Caching Laravel configuration and routes..."
    php artisan optimize:clear || true
    php artisan optimize || true
fi

echo "Starting server on port ${PORT:-80}..."
exec "$@"
