#!/bin/sh
set -e

# Sobe a API na porta interna 8000
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Sobe o Nginx na 8080
exec nginx -g "daemon off;"