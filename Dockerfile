# syntax=docker/dockerfile:1

FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

COPY . .
RUN composer dump-autoload --optimize --no-dev --no-interaction \
    && cp .env.example .env \
    && php artisan package:discover --ansi \
    && rm .env


FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build


FROM php:8.4-apache AS app

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/database/database.sqlite \
    SESSION_DRIVER=database \
    CACHE_STORE=database \
    QUEUE_CONNECTION=database

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libsqlite3-dev \
        libzip-dev \
        unzip \
        zlib1g-dev \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        opcache \
        pdo_sqlite \
        zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html
COPY --from=frontend /app/public/build /var/www/html/public/build

RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
        database \
    && chown -R www-data:www-data storage bootstrap/cache database \
    && chmod -R ug+rwx storage bootstrap/cache database

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
