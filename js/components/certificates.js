import { domCache, state } from "../config.js";
import { remainingText, formatExpirationTimestamp, escapeHtml } from '../utils/dom.js';

export function updateCounters(data) {
    requestAnimationFrame(() => {
        const totalCerts = document.querySelectorAll('#certs');
        if (totalCerts.length >= 2) {
            totalCerts[0].textContent = data.valid.length;
            totalCerts[1].textContent = data.expired.length;
        }

        const alerts = document.querySelector('#alerts');
        if (alerts) {
            alerts.textContent = data.expiringSoon.length;
        }

        const clusters = document.querySelector('#clusters');
        if (clusters) {
            clusters.textContent = data.sources_count;
        }
    });
}

export function innerCertificate(data) {
    if (!domCache.rows) return;

    const fragment = document.createDocumentFragment();
    
    if (!state.filteredDomains.length) {
        domCache.rows.classList.add('disabled');
        domCache.rows.innerHTML = `<i class="bi bi-box-seam"></i><p>Nenhum certificado encontrado.</p>`;
        return;
    }

    domCache.rows.classList.remove('disabled');

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const currentDomains = state.filteredDomains.slice(startIndex, startIndex + state.itemsPerPage);

    const domainCardsHTML = currentDomains.map(domain => {
        const { expired, text } = remainingText(domain.expiration);
        const expirationDate = formatExpirationTimestamp(domain.expiration);
        const statusClass = expired ? 'expired' : '';
        const statusText = expired ? 'Expirado' : 'Ativo';
        
        const safeName = escapeHtml(domain.name);
        const safeExpirationDate = escapeHtml(expirationDate);
        const safeText = escapeHtml(text);
        
        return `
        <div class="domain-card">
            <p>${safeName}</p>
            <div class="data-expired ${statusClass}">
                <span style="width: 80%;">${safeExpirationDate} ${safeText}</span>
                <span style="width: 20%; text-align: center;" class="status">${statusText}</span>
            </div>
            <button onclick='showDetails(${JSON.stringify(domain).replace(/"/g, '&quot;')})'>
                <i class="bi bi-eye-fill"></i>
            </button>
        </div>`;
    }).join('');

    domCache.rows.innerHTML = domainCardsHTML;
}