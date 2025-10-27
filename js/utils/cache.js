import { state, CACHE_DURATION } from "../config.js";

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function isCacheValid() {
    return Date.now() - state.lastCacheTime < CACHE_DURATION;
}

export async function fetchWithCache(url, useCache = true) {
    const cacheKey = url;
    
    if (useCache && state.cache.has(cacheKey) && isCacheValid()) {
        console.log('📦 Usando cache para:', url);
        return state.cache.get(cacheKey);
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (useCache) {
            state.cache.set(cacheKey, data);
            state.lastCacheTime = Date.now();
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}