// ================================
// IMPORTS
// ================================
import { 
    API_URL, 
    CACHE_DURATION, 
    ONE_MONTH_IN_SECONDS, 
    DEBOUNCE_DELAY,
    state,
    domCache,
    clusterName 
} from './config.js';

import { 
    debounce,
    isCacheValid,
    fetchWithCache 
} from './utils/cache.js';

import { 
    initDOMCache,
    showErrorMessage,
    remainingText,
    formatExpirationTimestamp,
    escapeHtml 
} from './utils/dom.js';

import { 
    getCertExporter,
    processCertificatesData,
    getEmptyDataStructure 
} from './services/api.js';

import { 
    loadHeader,
    generateNavigationHTML 
} from './components/header.js';

import { 
    updateCounters,
    innerCertificate 
} from './components/certificates.js';

import { 
    applyFilter,
    filterDomains,
    debouncedFilterDomains 
} from './components/filters.js';

import { 
    setupPagination,
    updatePagination 
} from './components/pagination.js';

import { 
    showDetails,
    closeModal 
} from './components/modal.js';

// ================================
// FUNÇÃO PRINCIPAL
// ================================
async function main() {
    try {
        console.log("🚀 Inicializando aplicação...");
        
        initDOMCache();
        
        const result = await getCertExporter();
        
        // Atualizar UI
        updateCounters(result);
        filterDomains('', result);
        innerCertificate(result);
        setupPagination(result);
        updatePagination(result);
        loadHeader();
        
        console.log("✅ Aplicação inicializada com sucesso");
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showErrorMessage('Erro ao inicializar aplicação');
    }
}

// ================================
// INICIALIZAÇÃO
// ================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}