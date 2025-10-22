export function showDetails(cert) {
    const modal = document.getElementById('cert-modal');

    document.getElementById('modal-name').textContent = cert.name || '-';
    document.getElementById('modal-secret').textContent = cert.secret || '-';
    document.getElementById('modal-namespace').textContent = cert.namespace || '-';
    document.getElementById('modal-issuer').textContent = cert.issuer || '-';
    document.getElementById('modal-issuer-kind').textContent = cert.issuer_kind || '-';
    document.getElementById('modal-issuer-group').textContent = cert.issuer_group || '-';
    document.getElementById('modal-expiration').textContent =
        formatExpirationTimestamp(cert.expiration) || '-';
    document.getElementById('modal-renewal').textContent =
        cert.renewal ? formatExpirationTimestamp(cert.renewal) : '-';
    document.getElementById('modal-status').textContent = cert.status || '-';

    modal.style.display = 'block';
}

export function closeModal() {
    document.getElementById('cert-modal').style.display = 'none';
}