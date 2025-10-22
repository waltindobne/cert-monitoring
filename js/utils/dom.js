export function initDOMCache() {
    domCache.itemsPageSelect = document.getElementById('items-page');
    domCache.itemsFilterSelect = document.getElementById('items-filter');
    domCache.searchInput = document.querySelector('.search input');
    domCache.rows = document.querySelector('.rows');
    domCache.paginateContainer = document.querySelector('.paginate');
    domCache.prevButton = document.querySelector('.paginate button:first-child');
    domCache.nextButton = document.querySelector('.paginate button:last-child');
    domCache.paginateUl = document.querySelector('.paginate ul');
}

export function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

export function remainingText(expirationTs) {
    const now = Math.floor(Date.now() / 1000);
    const diff = expirationTs - now;
    const expired = diff <= 0;

    const totalDays = Math.floor(Math.abs(diff) / 86400);
    const totalHours = Math.floor((Math.abs(diff) % 86400) / 3600);

    const text = expired
        ? `Expirado há ${totalDays}d`
        : `em ${totalDays}d ${totalHours}h`;

    return { expired, text };
}

export function formatExpirationTimestamp(timestampInSeconds) {
    const expirationDate = new Date(timestampInSeconds * 1000);
    const day = String(expirationDate.getDate()).padStart(2, '0');
    const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
    const year = expirationDate.getFullYear();
    return `${day}/${month}/${year}`;
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}