# =============================
# Imagem única com Python + Nginx
# =============================
FROM python:3.11-slim

# Instala Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copia a API
WORKDIR /app
COPY python/main.py /app/

# Instala dependências Python
RUN pip install --no-cache-dir fastapi uvicorn requests

# Remove arquivos padrão do Nginx
RUN rm -rf /var/www/html/*

# Copia o front-end
COPY . /var/www/html

# Copia entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expõe a porta externa
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]