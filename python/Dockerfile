# Usa uma imagem Python leve
FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários
COPY main.py /app/

# Instala dependências (FastAPI, Uvicorn e Requests)
RUN pip install --no-cache-dir fastapi uvicorn requests

# Expõe a porta 3000 (a mesma da API)
EXPOSE 8080

# Comando para iniciar o servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
