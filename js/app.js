import { initDOMCache, showErrorMessage } from './utils/dom.js';
import { getCertExporter } from './services/api.js';
import { loadHeader } from './components/header.js';
import { updateCounters, innerCertificate } from './components/certificates.js';
import { filterDomains } from './components/filters.js';
import { setupPagination, updatePagination } from './components/pagination.js';
import { showDetails, closeModal } from './components/modal.js';
import { initLoading, showLoading, hideLoading } from './components/loading.js';

window.showDetails = showDetails;
window.closeModal = closeModal;
window.showLoading = showLoading;
window.hideLoading = hideLoading;

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
        hideLoading();
        
        console.log("✅ Aplicação inicializada com sucesso");
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showErrorMessage('Erro ao inicializar aplicação');
        hideLoading();
    }
}

async function startApp() {
    await initLoading();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
}

startApp();