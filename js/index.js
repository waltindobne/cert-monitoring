let currentPage = 1;
const itemsPerPage = 10;
let allDomains = [];
let filteredDomains = [];

async function getCertExporter() {
    try {
        const response = await fetch('http://localhost:8080/metrics');

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const metrics = await response.text();
        console.log("✅ Sucesso ao puxar as métricas");
        return metrics;
    } catch (error) {
        console.error('❌ Erro ao puxar as métricas:', error);
        return null;
    }
}

function setupPagination() {
    const prevButton = document.querySelector('.paginate button:first-child');
    const nextButton = document.querySelector('.paginate button:last-child');
    const pageNumbers = document.querySelector('.paginate ul');

    // Configurar botões
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderDomains();
        }
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderDomains();
        }
    });

    // Configurar busca
    const searchInput = document.querySelector('.search input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterDomains(searchTerm);
    });

    // Configurar filtros de status
    const filterButtons = document.querySelectorAll('.search nav button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona active class ao botão clicado
            button.classList.add('active');
            
            const filter = button.textContent.toLowerCase();
            applyFilter(filter);
        });
    });
}

function filterDomains(searchTerm) {
    if (searchTerm === '') {
        filteredDomains = [...allDomains];
    } else {
        filteredDomains = allDomains.filter(domain => 
            domain.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    renderDomains();
}

function applyFilter(filter) {
    switch(filter) {
        case 'todos':
            filteredDomains = [...allDomains];
            break;
        case 'ativos':
            // Aqui você pode adicionar lógica para filtrar por status
            filteredDomains = [...allDomains];
            break;
        case 'expirados':
            // Aqui você pode adicionar lógica para filtrar por status
            filteredDomains = [...allDomains];
            break;
        case 'alertas':
            // Aqui você pode adicionar lógica para filtrar por status
            filteredDomains = [...allDomains];
            break;
        default:
            filteredDomains = [...allDomains];
    }
    currentPage = 1;
    renderDomains();
}

function renderDomains() {
    let rows = document.querySelector('.rows');
    if (!rows) return;

    rows.classList.remove('disabled');
    rows.innerHTML = '';

    if (!filteredDomains.length) {
        rows.innerHTML = `
            <i class="bi bi-box-seam"></i>
            <p>Nenhum certificado encontrado.</p>
        `;
        rows.classList.add('disabled');
        updatePaginationUI();
        return;
    }

    // Calcular itens para a página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDomains = filteredDomains.slice(startIndex, endIndex);

    // Renderizar domínios
    currentDomains.forEach(domain => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="domain-card">
                <p>${domain}</p>
                <span class="status">Ativo</span>
            </div>
        `;
        rows.appendChild(div);
    });

    updatePaginationUI();
    updateCounters();
}

function updatePaginationUI() {
    const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
    const prevButton = document.querySelector('.paginate button:first-child');
    const nextButton = document.querySelector('.paginate button:last-child');
    const pageNumbers = document.querySelector('.paginate ul');

    // Atualizar estado dos botões
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    // Atualizar números das páginas
    updatePageNumbers(totalPages);
}

function updatePageNumbers(totalPages) {
    const pageNumbers = document.querySelector('.paginate ul');
    pageNumbers.innerHTML = '';

    if (totalPages <= 1) {
        return;
    }

    // Sempre mostrar primeira página
    addPageNumber(1, totalPages);

    // Mostrar "..." se necessário
    if (currentPage > 3) {
        const li = document.createElement('li');
        li.textContent = '...';
        pageNumbers.appendChild(li);
    }

    // Mostrar páginas ao redor da atual
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
            addPageNumber(i, totalPages);
        }
    }

    // Mostrar "..." se necessário
    if (currentPage < totalPages - 2) {
        const li = document.createElement('li');
        li.textContent = '...';
        pageNumbers.appendChild(li);
    }

    // Sempre mostrar última página se houver mais de 1 página
    if (totalPages > 1) {
        addPageNumber(totalPages, totalPages);
    }
}

function addPageNumber(page, totalPages) {
    const pageNumbers = document.querySelector('.paginate ul');
    const li = document.createElement('li');
    li.textContent = page;
    
    if (page === currentPage) {
        li.classList.add('active');
    }

    li.addEventListener('click', () => {
        currentPage = page;
        renderDomains();
    });

    pageNumbers.appendChild(li);
}

function updateCounters() {
    // Atualizar contadores no resume
    const totalCerts = document.querySelectorAll('#certs');
    if (totalCerts.length >= 2) {
        totalCerts[0].textContent = allDomains.length; // Ativos
        totalCerts[1].textContent = '0'; // Expirados (você pode ajustar essa lógica)
    }
    
    const alerts = document.querySelector('#alerts');
    if (alerts) {
        alerts.textContent = '0'; // Alertas (você pode ajustar essa lógica)
    }
    
    const clusters = document.querySelector('#clusters');
    if (clusters) {
        clusters.textContent = '1'; // Clusters (você pode ajustar essa lógica)
    }
}

async function innerCertificate(certificados) {
    let rows = document.querySelector('.rows');
    if (!rows) return;

    rows.classList.remove('disabled');
    rows.innerHTML = '';

    if (!certificados) return;

    const lines = certificados.split('\n');

    allDomains = lines
        .map(line => {
            const match = line.match(/,name="([^"]+)"/);
            if (!match) return null;

            let name = match[1];
            if (name.endsWith('-secret')) {
                name = name.slice(0, -7);
            }
            return name;
        })
        .filter(Boolean);

    filteredDomains = [...allDomains];
    currentPage = 1;
    
    renderDomains();
}

async function main() {
    const certificados = await getCertExporter();
    await innerCertificate(certificados);
    setupPagination();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}