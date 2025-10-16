from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
    "http://10.5.2.9:9402/metrics",  # Inovacao 
    "http://10.5.2.13:9402/metrics",  # LugarhV2
    "http://10.5.2.14:9402/metrics" # RedRrasil
    "http://10.5.2.16:9402/metrics", # MailSender
]

def get_metric_response(urls):
    combined_metrics = ""
    success_count = 0

    for url in urls:
        try:
            r = requests.get(url, timeout=5)
            r.raise_for_status()
            combined_metrics += r.text + "\n"
            success_count += 1
        except Exception as e:
            combined_metrics += f"# Erro ao buscar métricas em {url}: {e}\n"

    return JSONResponse(content={
        "status": "success" if success_count > 0 else "error",
        "sources_count": success_count if success_count > 0 else 1,  # 👈 count mínimo 1
        "total_targets": len(urls),
        "metrics": combined_metrics.strip()
    })

@app.get("/")
def get_all_metrics():
    return get_metric_response(METRIC_URLS)

@app.get("/inovacao")
def get_inovacao_metrics():
    return get_metric_response([METRIC_URLS[0]])

@app.get("/lugarhv2")
def get_lugarhv2_metrics():
    return get_metric_response([METRIC_URLS[1]])

@app.get("/redbrasil")
def get_lugarhv2_metrics():
    return get_metric_response([METRIC_URLS[2]])

@app.get("/mailsender")
def get_lugarhv2_metrics():
    return get_metric_response([METRIC_URLS[3]])