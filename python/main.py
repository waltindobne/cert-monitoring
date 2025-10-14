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

@app.get("/metrics")
def get_metrics():
    try:
        url = "http://10.5.2.9:9402/metrics"
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return Response(content=r.text, media_type="text/plain")
    except Exception as e:
        return Response(content=f"Erro ao buscar métricas: {e}", status_code=500)
