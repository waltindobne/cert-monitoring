import { API_URL, clusterName } from "../config.js";
import { fetchWithCache } from "../utils/cache.js";

export async function loadHeader() {
    try {
        console.log("Loading header...");

        const header = document.getElementById("header-placeholder");
        if (!header) {
            console.error("Header placeholder not found");
            return;
        }

        const [htmlResponse, clustersData] = await Promise.all([
            fetch('../components/header.html'),
            fetchWithCache(`${API_URL}`)
        ]);

        if (!htmlResponse.ok) throw new Error(`Header error: ${htmlResponse.status}`);

        const htmlContent = await htmlResponse.text();
        header.innerHTML = htmlContent;

        const nav = document.querySelector('header nav');
        const navHTML = generateNavigationHTML(clustersData);
        nav.innerHTML = navHTML;

        console.log("Header loaded successfully");
    } catch (error) {
        console.error('Error loading header:', error);
        showErrorMessage('Erro ao carregar navegação');
    }
}

export function generateNavigationHTML(clustersData) {
    const activeClass = !clusterName ? "active" : "";
    
    let html = `
        <a href="/index.html" data-page="inicio" class="${activeClass}">
            <i class="bi bi-house-fill"></i>
            <p>Inicio</p>
        </a>
    `;

    const successClusters = clustersData.details.filter(item => item.status === 'success');
    const errorClusters = clustersData.details.filter(item => item.status === 'error');

    successClusters.forEach(item => {
        const isActive = clusterName === item.name.toLowerCase() ? "active" : "";
        html += `
            <a href="/cluster.html?value=${item.name.toLowerCase()}" 
                data-page="${item.name.toLowerCase()}" 
                class="${isActive}">
                <i class="devicon-kubernetes-plain"></i>
                <p>${item.name}</p>
            </a>
        `;
    });

    errorClusters.forEach(item => {
        html += `
            <a href="/cluster.html?value=${item.name.toLowerCase()}" 
                data-page="${item.name.toLowerCase()}" 
                class="notActive">
                <i class="devicon-kubernetes-plain"></i>
                <p>${item.name}</p>
            </a>
        `;
    });

    return html;
}