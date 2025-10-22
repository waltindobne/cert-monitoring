export const API_URL = 'http://localhost:8000';
export const CACHE_DURATION = 5 * 60 * 1000;
export const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
export const DEBOUNCE_DELAY = 300;

const params = new URLSearchParams(window.location.search);
export const clusterName = params.get('value');

export const state = {
    itemsPerPage: 10,
    currentPage: 1,
    activeFilter: 'todos',
    filteredDomains: [],
    cache: new Map(),
    lastCacheTime: 0
};

export const domCache = {
    itemsPageSelect: null,
    itemsFilterSelect: null,
    searchInput: null,
    rows: null,
    paginateContainer: null,
    prevButton: null,
    nextButton: null,
    paginateUl: null
};