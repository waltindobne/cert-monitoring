import { initDOMCache, showErrorMessage } from './utils/dom.js';
import { getCertExporter } from './services/api.js';
import { loadHeader } from './components/header.js';
import { updateCounters, innerCertificate } from './components/certificates.js';
import { filterDomains } from './components/filters.js';
import { setupPagination, updatePagination } from './components/pagination.js';
import { showDetails, closeModal } from './components/modal.js';

window.showDetails = showDetails;
window.closeModal = closeModal;

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}