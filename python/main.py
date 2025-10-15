from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

METRIC_URLS = [
    "http://10.5.2.9:9402/metrics", # Inovacao 
    "http://10.5.2.13:9402/metrics" # LugarhV2
]

@app.get("/")
def get_metrics():
    combined_metrics = ""
    success_count = 0

    for url in METRIC_URLS:
        try:
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            combined_metrics += r.text + "\n"
            success_count += 1
        except Exception as e:
            combined_metrics += f"# Erro ao buscar métricas em {url}: {e}\n"

    return {
        "status": "success",                # ← status da requisição
        "sources_count": success_count,     # ← número de URLs consultadas com sucesso
        "total_targets": len(METRIC_URLS),  # ← total de URLs que tentou consultar
        "metrics": combined_metrics.strip() # ← corpo das métricas
    }

@app.get("/inovacao")
def get_metrics():
    try:
        url = METRIC_URLS[0]
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return Response(content=r.text, media_type="text/plain")
    except Exception as e:
        return Response(content=f"Erro ao buscar métricas: {e}", status_code=500)


@app.get("/lugarhv2")
def get_metrics():
    try:
        url = METRIC_URLS[1]
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return Response(content=r.text, media_type="text/plain")
    except Exception as e:
        return Response(content=f"Erro ao buscar métricas: {e}", status_code=500)
