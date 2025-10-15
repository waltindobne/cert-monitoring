const API_URL = 'http://localhost:8080';
const clusters = [
    { name: 'Inovacao', metrics: `${API_URL}/inovacao` },
    { name: 'LugarhV2', metrics: `${API_URL}/lugarhv2` }
]
// Pega o 'value' da URL 
const params = new URLSearchParams(window.location.search);
const clusterName = params.get('value');

async function loadHeader() {
    try {
        console.log("Loading header...");

        // Inicia o placeholder do header
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
            <a href="/index.html" data-page="inicio">
              <i class="bi bi-house-fill"></i>
              <p>Inicio</p>
            </a>
        `;

        clusters.forEach(item => {
            html += `
            <a href="/cluster.html?value=${item.name.toLowerCase()}" data-page="${item.name.toLowerCase()}">
                <i class="devicon-kubernetes-plain"></i>
                <p>${item.name}</p>
            </a>
            `;
        });

        nav.innerHTML = html;

        detectActivePage();

        console.log("Header loaded successfully");
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function detectActivePage() {
    const currentPath = window.location.pathname;
    console.log(`Current path: ${currentPath}`);

    let activePage = '';

    if (currentPath === '/' || currentPath === '/index.html' || currentPath.includes('index')) {
        activePage = 'inicio';
    } else if (currentPath.includes('cert-by-cluster') || currentPath.includes('cluster')) {
        activePage = 'clusters';
    } else if (currentPath.includes('certificados') || currentPath.includes('certificates')) {
        activePage = 'certificados';
    } else if (currentPath.includes('configuracoes') || currentPath.includes('settings')) {
        activePage = 'configuracoes';
    }

    console.log(`Detected active page: ${activePage}`);
    applyActivePage(activePage);
}

function applyActivePage(activePage) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });

    const activeLink = document.querySelector(`[data-page="${activePage}"]`);

    if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
        console.log(`✅ Active page set to: ${activePage}`);
    } else {
        console.warn(`⚠️ No link found for page: ${activePage}`);
    }
}

async function getCertExporter() {
    try {
        let response;
        if (!clusterName) {
            response = await fetch(`http://localhost:8080/`);
        }
        else {
            response = await fetch(`http://localhost:8080/${clusterName}`);
        }

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const metrics = await response.json();
        console.log("✅ Sucesso ao puxar as métricas");
        return metrics;
    } catch (error) {
        console.error('❌ Erro ao puxar as métricas:', error);
        return null;
    }
}

async function main() {
    console.log("Global JS loaded");
    await loadHeader();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}