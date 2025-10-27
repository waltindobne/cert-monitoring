import { domCache, state } from "../config.js";
import { innerCertificate } from "./certificates.js";
import { applyFilter, filterDomains } from "./filters.js";
export function setupPagination(data) {
    if (!domCache.prevButton || !domCache.nextButton || !domCache.searchInput) {
        console.warn('Elementos de paginação não encontrados');
        return;
    }

    domCache.prevButton.replaceWith(domCache.prevButton.cloneNode(true));
    domCache.nextButton.replaceWith(domCache.nextButton.cloneNode(true));
    
    domCache.prevButton = document.querySelector('.paginate button:first-child');
    domCache.nextButton = document.querySelector('.paginate button:last-child');

    domCache.prevButton.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            innerCertificate(data);
            updatePagination(data);
        }
    });

    domCache.nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredDomains.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            innerCertificate(data);
            updatePagination(data);
        }
    });

    domCache.searchInput.addEventListener('input', e => {
        filterDomains(e.target.value, data);
    });

    if (domCache.itemsPageSelect) {
        domCache.itemsPageSelect.addEventListener('change', (e) => {
            state.itemsPerPage = parseInt(e.target.value);
            state.currentPage = 1;
            innerCertificate(data);
            updatePagination(data);
        });
    }

    if (domCache.itemsFilterSelect) {
        domCache.itemsFilterSelect.addEventListener('change', (e) => {
            const selected = e.target.value.toLowerCase();
            applyFilter(selected, data);

            const searchTerm = domCache.searchInput.value;
            if (searchTerm) {
                filterDomains(searchTerm, data);
            }
        });
    }
}

export function updatePagination(data) {
    const totalPages = Math.ceil(state.filteredDomains.length / state.itemsPerPage);
    
    if (!domCache.paginateContainer || !domCache.paginateUl) return;

    if (totalPages <= 1) {
        domCache.paginateContainer.style.display = 'none';
        return;
    } else {
        domCache.paginateContainer.style.display = 'flex';
    }

    domCache.paginateUl.innerHTML = '';

    if (domCache.prevButton) domCache.prevButton.disabled = state.currentPage === 1;
    if (domCache.nextButton) domCache.nextButton.disabled = state.currentPage === totalPages || totalPages === 0;

    if (totalPages <= 1) return;

    const addPage = page => {
        const li = document.createElement('li');
        li.textContent = page;
        if (page === state.currentPage) li.classList.add('active');
        li.addEventListener('click', () => {
            state.currentPage = page;
            innerCertificate(data);
            updatePagination(data);
        });
        domCache.paginateUl.appendChild(li);
    };

    addPage(1);
    if (state.currentPage > 3) {
        const ellipsis = document.createElement('li');
        ellipsis.textContent = '...';
        domCache.paginateUl.appendChild(ellipsis);
    }

    const start = Math.max(2, state.currentPage - 1);
    const end = Math.min(totalPages - 1, state.currentPage + 1);
    for (let i = start; i <= end; i++) addPage(i);

    if (state.currentPage < totalPages - 2) {
        const ellipsis = document.createElement('li');
        ellipsis.textContent = '...';
        domCache.paginateUl.appendChild(ellipsis);
    }
    if (totalPages > 1) addPage(totalPages);
}