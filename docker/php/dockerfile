# docker/php/Dockerfile
FROM php:8.1-fpm

# ---- OS & libs ----
RUN apt-get update \
 && apt-get install -y \
      libicu-dev \
      libpq-dev \
      zip \
      unzip \
      git \
 && docker-php-ext-install intl pdo_mysql pdo_pgsql \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# ---- Composer ----
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www
