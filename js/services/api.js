import { showErrorMessage } from "../utils/dom.js";
import { clusterName, API_URL, ONE_MONTH_IN_SECONDS } from "../config.js";
import { fetchWithCache } from "../utils/cache.js";

export async function getCertExporter() {
    try {
        const url = clusterName ? `${API_URL}/${clusterName}` : API_URL;
        const result = await fetchWithCache(url);
        
        return processCertificatesData(result);

    } catch (error) {
        console.error('❌ Erro ao puxar as métricas:', error);
        showErrorMessage('Erro ao carregar dados dos certificados');
        return getEmptyDataStructure();
    }
}

export function processCertificatesData(result) {
    const now = Math.floor(Date.now() / 1000);
    const all = result.certificates || [];
    
    const classification = all.reduce((acc, cert) => {
        const expiration = cert.expiration;
        const timeUntilExpiry = expiration - now;
        
        if (expiration <= now) {
            acc.expired.push(cert);
        } else if (timeUntilExpiry <= ONE_MONTH_IN_SECONDS) {
            acc.expiringSoon.push(cert);
            acc.valid.push(cert);
        } else {
            acc.valid.push(cert);
        }
        
        return acc;
    }, { valid: [], expired: [], expiringSoon: [] });

    const sourcesCount = result.details?.filter(item => item.status === 'success').length || 0;

    console.log(`✅ Métricas processadas`);
    console.log(`Total: ${all.length} | Válidos: ${classification.valid.length} | Expirados: ${classification.expired.length} | Expirando em 30 dias: ${classification.expiringSoon.length}`);

    return {
        total: all.length,
        valid: classification.valid,
        expired: classification.expired,
        expiringSoon: classification.expiringSoon,
        all,
        sources_count: sourcesCount,
        details: result.details || []
    };
}

export function getEmptyDataStructure() {
    return {
        total: 0,
        valid: [],
        expired: [],
        expiringSoon: [],
        all: [],
        sources_count: 0,
        details: []
    };
}