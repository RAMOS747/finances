FROM dunglas/frankenphp

RUN install-php-extensions pdo pdo_mysql mbstring

COPY . /app

WORKDIR /app

CMD ["frankenphp", "run", "--config", "/app/Caddyfile"]