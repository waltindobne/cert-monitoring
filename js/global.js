const API_URL = 'http://localhost:8000';
const params = new URLSearchParams(window.location.search);
const clusterName = params.get('value');


let itemsPerPage = 10;
let currentPage = 1;
let activeFilter = 'todos';
let filteredDomains = [];

const itemsPageSelect = document.getElementById('items-page');
const itemsFilterSelect = document.getElementById('items-filter');

async function loadHeader() {
    try {
        console.log("Loading header...");

        const header = document.getElementById("header-placeholder");
        if (!header) {
            console.error("Header placeholder not found");
            return;
        }

        const [htmlResponse, clustersResponse] = await Promise.all([
            fetch('/components/header.html'),
            fetch(`${API_URL}`)
        ]);

        if (!htmlResponse.ok) throw new Error(`Header error: ${htmlResponse.status}`);
        if (!clustersResponse.ok) throw new Error(`Clusters error: ${clustersResponse.status}`);

        const htmlContent = await htmlResponse.text();
        const clustersData = await clustersResponse.json();

        header.innerHTML = htmlContent;

        const nav = document.querySelector('header nav');
        let html = `
            <a href="/index.html" data-page="inicio" class="${!clusterName ? "active" : ""}">
              <i class="bi bi-house-fill"></i>
              <p>Inicio</p>
            </a>
        `;

        clustersData.details.forEach(item=> {
            if (item.status == 'success') {
                html += `
                    <a href="/cluster.html?value=${item.name.toLowerCase()}" 
                        data-page="${item.name.toLowerCase()}" 
                        class="${clusterName == item.name.toLowerCase() ? "active" : ""}">
                        <i class="devicon-kubernetes-plain"></i>
                        <p>${item.name}</p>
                    </a>
                `;
            }
        });

        clustersData.details.forEach(item=> {
            if (item.status == 'error') {
                html += `
                    <a href="/cluster.html?value=${item.name.toLowerCase()}" 
                        data-page="${item.name.toLowerCase()}" 
                        class="notActive">
                        <i class="devicon-kubernetes-plain"></i>
                        <p>${item.name}</p>
                    </a>
                `;
            }
        });

        nav.innerHTML = html;

        console.log("Header loaded successfully");
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function remainingText(expirationTs) {
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

function formatExpirationTimestamp(timestampInSeconds) {
    const expirationDate = new Date(timestampInSeconds * 1000);
    const day = String(expirationDate.getDate()).padStart(2, '0');
    const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
    const year = expirationDate.getFullYear();
    return `${day}/${month}/${year}`;
}

async function getCertExporter() {
    try {
        const url = clusterName ? `${API_URL}/${clusterName}` : API_URL;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const now = Math.floor(Date.now() / 1000);
        const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

        const all = result.certificates;
        const valid = [];
        const expired = [];
        const expiringSoon = [];
        let counts = 0;

        all.forEach(cert => {
            const expiration = cert.expiration;
            if (expiration <= now) {
                expired.push(cert);
            } else if (expiration - now <= ONE_MONTH_IN_SECONDS) {
                expiringSoon.push(cert);
                valid.push(cert);
            } else {
                valid.push(cert);
            }
        });

        result.details.forEach(item => {
            if (item.status == 'success') {
                counts++;
            }
        })

        console.log(counts);

        console.log(`✅ Métricas recebidas`);
        console.log(`Total: ${all.length} | Válidos: ${valid.length} | Expirados: ${expired.length} | Expirando em 30 dias: ${expiringSoon.length}`);

        return {
            total: all.length,
            valid,
            expired,
            expiringSoon,
            all,
            sources_count: counts,
            details: result.details
        };

    } catch (error) {
        console.error('❌ Erro ao puxar as métricas:', error);
        return {
            total: 0,
            valid: [],
            expired: [],
            expiringSoon: [],
            all: [],
            sources_count: 0
        };
    }
}

function updateCounters(data) {
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
}

async function innerCertificate(data) {
    const rows = document.querySelector('.rows');
    if (!rows) return;

    rows.innerHTML = '';

    if (!filteredDomains.length) {
        rows.classList.add('disabled');
        rows.innerHTML = `<i class="bi bi-box-seam"></i><p>Nenhum certificado encontrado.</p>`;
        return;
    }

    rows.classList.remove('disabled');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDomains = filteredDomains.slice(startIndex, startIndex + itemsPerPage);

    currentDomains.forEach(domain => {
        const { expired, text } = remainingText(domain.expiration);
        const expirationDate = formatExpirationTimestamp(domain.expiration);

        rows.innerHTML += `
        <div class="domain-card">
            <p>${domain.name}</p>
            <div class="data-expired ${expired ? 'expired' : ''}">
                <span style="width: 80%;">${expirationDate} (${text})</span>
                <span style="width: 20%; text-align: center;" class="status">${expired ? 'Expirado' : 'Ativo'}</span>
            </div>
            <button onclick='showDetails(${JSON.stringify(domain)})'>
                <i class="bi bi-eye-fill"></i>
            </button>
        </div>`;
    });
}


function applyFilter(filter, data) {
    activeFilter = filter;
    switch (filter) {
        case 'todos':
            filteredDomains = data.all;
            break;
        case 'ativos':
            filteredDomains = data.valid;
            break;
        case 'expirados':
            filteredDomains = data.expired;
            break;
        case 'alertas':
            filteredDomains = data.expiringSoon;
            break;
        default:
            filteredDomains = data.all;
    }
    currentPage = 1;
    innerCertificate(data);
    updatePagination(data);
}

function filterDomains(searchTerm, data) {
    let baseList;

    switch (activeFilter) {
        case 'ativos':
            baseList = data.valid;
            break;
        case 'expirados':
            baseList = data.expired;
            break;
        case 'alertas':
            baseList = data.expiringSoon;
            break;
        default:
            baseList = data.all;
    }

    if (searchTerm === '') {
        filteredDomains = baseList;
    } else {
        filteredDomains = baseList.filter(domain =>
            domain.name.toLowerCase().includes(searchTerm)
        );
    }

    currentPage = 1;
    innerCertificate(data);
    updatePagination(data);
}

function setupPagination(data) {
    const prev = document.querySelector('.paginate button:first-child');
    const next = document.querySelector('.paginate button:last-child');
    const searchInput = document.querySelector('.search input');

    prev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            innerCertificate(data);
            updatePagination(data);
        }
    });

    next.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            innerCertificate(data);
            updatePagination(data);
        }
    });

    searchInput.addEventListener('input', e => {
        filterDomains(e.target.value.toLowerCase(), data);
        updatePagination(data);
    });

    if (itemsPageSelect) {
        itemsPageSelect.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            innerCertificate(data);
            updatePagination(data);
        });
    }

    if (itemsFilterSelect) {
        itemsFilterSelect.addEventListener('change', (e) => {
            const selected = e.target.value.toLowerCase();
            applyFilter(selected, data);

            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filterDomains(searchTerm, data);
            }
        });
    }
}


function updatePagination(data) {
    const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
    const prev = document.querySelector('.paginate button:first-child');
    const next = document.querySelector('.paginate button:last-child');
    const ul = document.querySelector('.paginate ul');
    const paginateContainer = document.querySelector('.paginate');

    if (totalPages <= 1) {
        paginateContainer.style.display = 'none';
        return;
    } else {
        paginateContainer.style.display = 'flex';
    }

    ul.innerHTML = '';

    prev.disabled = currentPage === 1;
    next.disabled = currentPage === totalPages || totalPages === 0;

    if (totalPages <= 1) return;

    const addPage = page => {
        const li = document.createElement('li');
        li.textContent = page;
        if (page === currentPage) li.classList.add('active');
        li.addEventListener('click', () => {
            currentPage = page;
            innerCertificate(data);
            updatePagination(data);
        });
        ul.appendChild(li);
    };

    addPage(1);
    if (currentPage > 3) ul.appendChild(Object.assign(document.createElement('li'), { textContent: '...' }));

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) addPage(i);

    if (currentPage < totalPages - 2) ul.appendChild(Object.assign(document.createElement('li'), { textContent: '...' }));
    if (totalPages > 1) addPage(totalPages);
}

function showDetails(cert) {
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

function closeModal() {
    document.getElementById('cert-modal').style.display = 'none';
}

document.querySelector('.close-btn').addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    const modal = document.getElementById('cert-modal');
    if (event.target === modal) {
        closeModal();
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

async function main() {
    console.log("Global JS loaded");
    const result = await getCertExporter();
    await updateCounters(result);
    await filterDomains('', result);
    await innerCertificate(result);
    await setupPagination(result);
    await updatePagination(result);
    await loadHeader();
}