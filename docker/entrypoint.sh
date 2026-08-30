#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

# Empty compose APP_KEY must not override a generated .env key.
if [ -z "${APP_KEY:-}" ]; then
    unset APP_KEY
fi

if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_PATH="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    mkdir -p "$(dirname "$DB_PATH")"
    touch "$DB_PATH"
fi

if ! grep -qE '^APP_KEY=base64:.+' .env 2>/dev/null; then
    php artisan key:generate --force --no-interaction
fi

chown -R www-data:www-data storage bootstrap/cache database || true
chmod -R ug+rwx storage bootstrap/cache database || true

php artisan migrate --force --no-interaction

BOARD_COUNT="$(php -r "require 'vendor/autoload.php'; \$app = require 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo App\Models\Board::query()->count();")"

if [ "$BOARD_COUNT" = "0" ]; then
    php artisan db:seed --force --no-interaction
fi

php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

exec apache2-foreground
