import { debounce } from '../utils/cache.js';
import { DEBOUNCE_DELAY } from '../config.js';

export function applyFilter(filter, data) {
    state.activeFilter = filter;
    
    const filterMap = {
        'todos': data.all,
        'ativos': data.valid,
        'expirados': data.expired,
        'alertas': data.expiringSoon
    };
    
    state.filteredDomains = filterMap[filter] || data.all;
    state.currentPage = 1;
    
    innerCertificate(data);
    updatePagination(data);
}

export const debouncedFilterDomains = debounce((searchTerm, data) => {
    let baseList;

    switch (state.activeFilter) {
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
        state.filteredDomains = baseList;
    } else {
        const lowerSearchTerm = searchTerm.toLowerCase();
        state.filteredDomains = baseList.filter(domain =>
            domain.name.toLowerCase().includes(lowerSearchTerm)
        );
    }

    state.currentPage = 1;
    innerCertificate(data);
    updatePagination(data);
}, DEBOUNCE_DELAY);

export function filterDomains(searchTerm, data) {
    debouncedFilterDomains(searchTerm, data);
}