import re
from datetime import datetime
from collections import defaultdict
from fastapi.responses import JSONResponse
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
    {"name": "Inovacao", "url": "http://10.5.2.9:9402/metrics"},
    {"name": "LugarhV2", "url": "http://10.5.2.13:9402/metrics"},
    {"name": "RedBrasil", "url": "http://10.5.2.14:9402/metrics"},
    {"name": "MailSender", "url": "http://10.5.2.16:9402/metrics"},
]

def parse_cert_metrics(metrics_text):
    grouped = defaultdict(dict)
    lines = metrics_text.strip().split("\n")

    for line in lines:
        if 'name="' not in line or 'certmanager_certificate_' not in line:
            continue

        # Extrai labels principais
        name_match = re.search(r'(?<!issuer_)name="([^"]+)"', line)
        name_secret_match = re.search(r'(?<!issuer_)name="([^"]+)"', line)
        namespace_match = re.search(r'namespace="([^"]+)"', line)
        issuer_name_match = re.search(r'issuer_name="([^"]+)"', line)
        issuer_kind_match = re.search(r'issuer_kind="([^"]+)"', line)
        issuer_group_match = re.search(r'issuer_group="([^"]+)"', line)
        value_match = re.search(r' ([0-9.eE+-]+)$', line)

        if not name_match or not value_match:
            continue

        name = name_match.group(1).replace('-secret', '')
        value = float(value_match.group(1))

        
        # Salva labels no dicionário
        if name_secret_match:
            grouped[name]['secret'] = name_secret_match.group(1)
        if namespace_match:
            grouped[name]['namespace'] = namespace_match.group(1)
        if issuer_name_match:
            grouped[name]['issuer_name'] = issuer_name_match.group(1)
        if issuer_kind_match:
            grouped[name]['issuer_kind'] = issuer_kind_match.group(1)
        if issuer_group_match:
            grouped[name]['issuer_group'] = issuer_group_match.group(1)

        if 'expiration_timestamp_seconds' in line:
            grouped[name]['expiration'] = value
        elif 'renewal_timestamp_seconds' in line:
            grouped[name]['renewal'] = value
        elif 'ready_status' in line and 'condition="True"' in line:
            grouped[name]['status'] = 'Ativo' if value == 1 else 'Inativo'

    # Monta resposta limpa
    now = datetime.utcnow().timestamp()
    clean = []
    for name, data in grouped.items():
        expiration = data.get('expiration', 0)
        renewal = data.get('renewal', 0)
        status = data.get('status', 'Desconhecido')
        clean.append({
            'name': name,
            'secret': data.get('secret', ''),
            'namespace': data.get('namespace', ''),
            'issuer': data.get('issuer_name', ''),
            'issuer_kind': data.get('issuer_kind', ''),
            'issuer_group': data.get('issuer_group', ''),
            'expiration': expiration,
            'renewal': renewal,
            'status': status,
            'expired': expiration <= now if expiration else True
        })

    return clean

def get_metric_response(sources):
    metrics_aggregated = ""
    details = []

    for source in sources:
        try:
            r = requests.get(source["url"], timeout=5)
            r.raise_for_status()
            metrics_aggregated += r.text + "\n"
            details.append({"name": source["name"], "status": "success", "url": source["url"]})
        except Exception as e:
            details.append({"name": source["name"], "status": "error", "url": source["url"], "error": str(e)})

    consolidated = parse_cert_metrics(metrics_aggregated)

    return JSONResponse(content={
        "status": "success",
        "details": details,
        "certificates": consolidated
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
def get_redbrasil_metrics():
    return get_metric_response([METRIC_URLS[2]])

@app.get("/mailsender")
def get_mailsender_metrics():
    return get_metric_response([METRIC_URLS[3]])
