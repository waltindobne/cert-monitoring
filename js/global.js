async function loadHeader() {
    try {
        console.log("Loading header...");
        const header = document.getElementById("header-placeholder");
        
        if (!header) {
            console.error("Header placeholder not found");
            return;
        }

        // Obter o valor do atributo 'value' (página ativa)
        const activePage = header.getAttribute('value');
        console.log(`Active page: ${activePage}`);

        const response = await fetch('/html/components/header.html');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.text();
        header.innerHTML = data;
        
        // Aplicar a classe/styling para a página ativa
        if (activePage) {
            applyActivePage(activePage);
        }
        
        console.log("Header loaded successfully");
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function applyActivePage(activePage) {
    // Encontrar o link correspondente à página ativa
    const activeLink = document.querySelector(`[data-page="${activePage}"]`);
    
    if (activeLink) {
        // Adicionar classe 'active' ao link
        activeLink.classList.add('active');
        
        // Ou modificar estilos diretamente
        activeLink.style.fontWeight = 'bold';
        activeLink.style.color = 'var(--primary)'; // Use sua variável CSS
    }
}

async function main() {
    console.log("Global JS loaded");
    await loadHeader();
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}