async function loadHeader() {
    try {
        console.log("Loading header...");
        const header = document.getElementById("header-placeholder");
        
        if (!header) {
            console.error("Header placeholder not found");
            return;
        }

        const response = await fetch('/html/components/header.html');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        header.innerHTML = data;
    
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

async function main() {
    console.log("Global JS loaded");
    await loadHeader();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}