const API_URL = 'http://localhost:8080';
const clusters = [
    { name: 'Inovacao', metrics: `${API_URL}/inovacao` },
    { name: 'LugarhV2', metrics: `${API_URL}/lugarhv2` },
    { name: 'RedBrasil', metrics: `${API_URL}/redbrasil` },
    { name: 'MailSender', metrics: `${API_URL}/mailsender` }
]
// Pega o 'value' da URL 
const params = new URLSearchParams(window.location.search);
const clusterName = params.get('value');

let currentPage = 1;
const itemsPerPage = 15;
let activeFilter = 'todos';
let filteredDomains = [];

async function loadHeader() {
    try {
        console.log("Loading header...");

        const header = document.getElementById("header-placeholder");

        if (!header) {
            console.error("Header placeholder not found");
            return;
        }

        const response = await fetch('/components/header.html');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        header.innerHTML = data;

        const nav = document.querySelector('header nav');
        let html = `
            <a href="/index.html" data-page="inicio" class="${!clusterName ? "active" : ""}">
              <i class="bi bi-house-fill"></i>
              <p>Inicio</p>
            </a>
        `;

        clusters.forEach(item => {
            html += `
            <a href="/cluster.html?value=${item.name.toLowerCase()}" data-page="${item.name.toLowerCase()}" class="${clusterName == item.name.toLowerCase() ? "active" : ""}">
                <i class="devicon-kubernetes-plain"></i>
                <p>${item.name}</p>
            </a>
            `;
        });

        nav.innerHTML = html;

        console.log("Header loaded successfully");
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function timeNow(seconds) {
    if (seconds === 0) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
    }

    const expired = seconds < 0;
    seconds = Math.abs(seconds); // trabalhar sempre com valor positivo

    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    seconds %= (365 * 24 * 60 * 60);

    const months = Math.floor(seconds / (30 * 24 * 60 * 60));
    seconds %= (30 * 24 * 60 * 60);

    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= (24 * 60 * 60);

    const hours = Math.floor(seconds / (60 * 60));
    seconds %= (60 * 60);

    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    return { years, months, days, hours, minutes, seconds, expired };
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
        const all = [], valid = [], expired = [], expiringSoon = [];

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const now = Math.floor(Date.now() / 1000);
        const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

        const result = await response.json();
        const lines = result.metrics.split('\n');
        lines.forEach(line => {
            const nameMatch = line.match(/,name="([^"]+)"/);
            if (!nameMatch) return;

            let name = nameMatch[1];
            if (name.endsWith('-secret')) {
                name = name.slice(0, -7);
            }

            const expirationMatch = line.match(/ ([0-9.e+-]+)$/);
            const expiration = expirationMatch ? parseFloat(expirationMatch[1]) : 0;
            if (!expiration) return;

            const cert = { name, expiration };

            all.push(cert);

            if (expiration <= now) {
                expired.push(cert);
            } else if (expiration - now <= ONE_MONTH_IN_SECONDS) {
                expiringSoon.push(cert);
                valid.push(cert);
            } else {
                valid.push(cert);
            }
        });

        console.log(`✅ Sucesso ao puxar as métricas`);
        console.log(`Total: ${all.length} | Válidos: ${valid.length} | Expirados: ${expired.length} | Expirando em 30 dias: ${expiringSoon.length}`);

        return {
            total: all.length,
            valid,
            expired,
            expiringSoon,
            all,
            sources_count: result.sources_count
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
        totalCerts[0].textContent = data.valid.length; // Certificados válidos 
        totalCerts[1].textContent = data.expired.length; // Certificados expirados
    }

    const alerts = document.querySelector('#alerts');
    if (alerts) {
        alerts.textContent = data.expiringSoon.length; // Certificados expirando em 30 dias
    }

    const clusters = document.querySelector('#clusters');
    if (clusters) {
        clusters.textContent = data.sources_count; // Clusters (você pode ajustar essa lógica)
    }
}

async function innerCertificate(data) {
    let rows = document.querySelector('.rows');
    if (!rows) return;

    rows.classList.remove('disabled');
    rows.innerHTML = '';

    if (!data) return; 

    filteredDomains = filteredDomains.length ? filteredDomains : data.all;

    if (!filteredDomains.length) {
        rows.innerHTML = `
            <i class="bi bi-box-seam"></i>
            <p>Nenhum certificado encontrado.</p>
        `;
        rows.classList.add('disabled');
        updatePaginationUI();
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDomains = filteredDomains.slice(startIndex, endIndex);

    currentDomains.forEach(domain => {
        const div = document.createElement('div');
     const now = Math.floor(Date.now() / 1000);
        const secondsRemaining = domain.expiration - now;
        const timeToExpire = timeNow(secondsRemaining);

        // Formatar data de expiração
        const expirationDate = formatExpirationTimestamp(domain.expiration);

        let expirationText = expirationDate;
        if (timeToExpire.expired) {
            expirationText += ` (Expirado há ${timeToExpire.days}d ${timeToExpire.hours}h ${timeToExpire.minutes}min)`;
        } else {
            expirationText += ` (em ${timeToExpire.days}d ${timeToExpire.hours}h ${timeToExpire.minutes}min)`;
        }

        // Definir status
        const statusClass = timeToExpire.expired ? 'expired' : '';
        const statusText = timeToExpire.expired ? 'Expirado' : 'Ativo';

        div.innerHTML = `
            <div class="domain-card ${statusClass}">
                <p>${domain.name}</p>
                <span>${expirationText}</span>
                <span class="status">${statusText}</span>
            </div>
        `;

        rows.appendChild(div);
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

    // Usa o filtro ativo para decidir qual lista usar
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

    // Aplica a busca sobre a lista filtrada
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
    const filterButtons = document.querySelectorAll('.search nav button');

    // Navegação
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

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.textContent.toLowerCase(), data);
        });
    });
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
        paginateContainer.style.display = 'flex'; // ou 'block', dependendo do seu layout
    }

    ul.innerHTML = '';

    prev.disabled = currentPage === 1;
    next.disabled = currentPage === totalPages || totalPages === 0;

    // Nenhuma página
    if (totalPages <= 1) return;

    // Helper pra criar botões numerados
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

    // Sempre mostra primeira e última
    addPage(1);
    if (currentPage > 3) ul.appendChild(Object.assign(document.createElement('li'), { textContent: '...' }));

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) addPage(i);

    if (currentPage < totalPages - 2) ul.appendChild(Object.assign(document.createElement('li'), { textContent: '...' }));
    if (totalPages > 1) addPage(totalPages);
}

async function main() {
    console.log("Global JS loaded");
    const result = await getCertExporter();
    await updateCounters(result);
    await filterDomains('', result);
    await innerCertificate(result);
    await setupPagination(result);
    await updatePagination(result);
    console.log(result);
    await loadHeader();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}