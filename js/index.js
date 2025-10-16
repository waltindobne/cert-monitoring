// let currentPage = 1;
// const itemsPerPage = 15;
// let qntdClusters = 0;
// let allDomains = [];
// let filteredDomains = [];

// console.log(clusters);

// function timeNow(seconds) {
//     if (seconds === 0) {
//         return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
//     }

//     const expired = seconds < 0;
//     seconds = Math.abs(seconds); // trabalhar sempre com valor positivo

//     const years = Math.floor(seconds / (365 * 24 * 60 * 60));
//     seconds %= (365 * 24 * 60 * 60);

//     const months = Math.floor(seconds / (30 * 24 * 60 * 60));
//     seconds %= (30 * 24 * 60 * 60);

//     const days = Math.floor(seconds / (24 * 60 * 60));
//     seconds %= (24 * 60 * 60);

//     const hours = Math.floor(seconds / (60 * 60));
//     seconds %= (60 * 60);

//     const minutes = Math.floor(seconds / 60);
//     seconds = Math.floor(seconds % 60);

//     return { years, months, days, hours, minutes, seconds, expired };
// }

// function formatExpirationTimestamp(timestampInSeconds) {
//     const expirationDate = new Date(timestampInSeconds * 1000);
//     const day = String(expirationDate.getDate()).padStart(2, '0');
//     const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
//     const year = expirationDate.getFullYear();
//     return `${day}/${month}/${year}`;
// }




// function setupPagination() {
//     const prevButton = document.querySelector('.paginate button:first-child');
//     const nextButton = document.querySelector('.paginate button:last-child');
//     const pageNumbers = document.querySelector('.paginate ul');

//     // Configurar botões
//     prevButton.addEventListener('click', () => {
//         if (currentPage > 1) {
//             currentPage--;
//             renderDomains();
//         }
//     });

//     nextButton.addEventListener('click', () => {
//         const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
//         if (currentPage < totalPages) {
//             currentPage++;
//             renderDomains();
//         }
//     });

//     // Configurar busca
//     const searchInput = document.querySelector('.search input');
//     searchInput.addEventListener('input', (e) => {
//         const searchTerm = e.target.value.toLowerCase();
//         filterDomains(searchTerm);
//     });

//     // Configurar filtros de status
//     const filterButtons = document.querySelectorAll('.search nav button');
//     filterButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             // Remove active class de todos os botões
//             filterButtons.forEach(btn => btn.classList.remove('active'));
//             // Adiciona active class ao botão clicado
//             button.classList.add('active');

//             const filter = button.textContent.toLowerCase();
//             applyFilter(filter);
//         });
//     });
// }

// function applyFilter(filter) {
//     switch (filter) {
//         case 'todos':
//             filteredDomains = allDomains;
//             break;
//         case 'ativos':
//             filteredDomains = allDomains.filter(domain => domain.expiration > 0);
//             break;
//         case 'expirados':
//             filteredDomains = allDomains.filter(domain => domain.expiration <= 0);
//             break;
//         case 'alertas':
//             // Aqui você pode adicionar lógica para filtrar por status
//             filteredDomains = allDomains.filter(domain => domain.expiration <= 7 * 24 * 3600 && domain.expiration > 0); // Exemplo: expiração em 7 dias
//             break;
//         default:
//             filteredDomains = [...allDomains];
//     }
//     currentPage = 1;
//     renderDomains();
// }

// function renderDomains() {
//     let rows = document.querySelector('.rows');
//     if (!rows) return;

//     rows.classList.remove('disabled');
//     rows.innerHTML = '';

//     if (!filteredDomains.length) {
//         rows.innerHTML = `
//             <i class="bi bi-box-seam"></i>
//             <p>Nenhum certificado encontrado.</p>
//         `;
//         rows.classList.add('disabled');
//         updatePaginationUI();
//         return;
//     }

//     // Calcular itens para a página atual
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const currentDomains = filteredDomains.slice(startIndex, endIndex);

//     // Renderizar domínios
//     currentDomains.forEach(domain => {
//         const div = document.createElement('div');
//      const now = Math.floor(Date.now() / 1000);
//         const secondsRemaining = domain.expiration - now;
//         const timeToExpire = timeNow(secondsRemaining);

//         // Formatar data de expiração
//         const expirationDate = formatExpirationTimestamp(domain.expiration);

//         let expirationText = expirationDate;
//         if (timeToExpire.expired) {
//             expirationText += ` (Expirado há ${timeToExpire.days}d ${timeToExpire.hours}h ${timeToExpire.minutes}min)`;
//         } else {
//             expirationText += ` (em ${timeToExpire.days}d ${timeToExpire.hours}h ${timeToExpire.minutes}min)`;
//         }

//         // Definir status
//         const statusClass = timeToExpire.expired ? 'expired' : '';
//         const statusText = timeToExpire.expired ? 'Expirado' : 'Ativo';

//         div.innerHTML = `
//             <div class="domain-card ${statusClass}">
//                 <p>${domain.name}</p>
//                 <span>${expirationText}</span>
//                 <span class="status">${statusText}</span>
//             </div>
//         `;

//         rows.appendChild(div);
//     });

//     updatePaginationUI();
// }


// function updatePaginationUI() {
//     const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
//     const prevButton = document.querySelector('.paginate button:first-child');
//     const nextButton = document.querySelector('.paginate button:last-child');
//     const pageNumbers = document.querySelector('.paginate ul');

//     // Atualizar estado dos botões
//     prevButton.disabled = currentPage === 1;
//     nextButton.disabled = currentPage === totalPages || totalPages === 0;

//     // Atualizar números das páginas
//     updatePageNumbers(totalPages);
// }

// function updatePageNumbers(totalPages) {
//     const pageNumbers = document.querySelector('.paginate ul');
//     pageNumbers.innerHTML = '';

//     if (totalPages <= 1) {
//         return;
//     }

//     // Sempre mostrar primeira página
//     addPageNumber(1, totalPages);

//     // Mostrar "..." se necessário
//     if (currentPage > 3) {
//         const li = document.createElement('li');
//         li.textContent = '...';
//         pageNumbers.appendChild(li);
//     }

//     // Mostrar páginas ao redor da atual
//     const startPage = Math.max(2, currentPage - 1);
//     const endPage = Math.min(totalPages - 1, currentPage + 1);

//     for (let i = startPage; i <= endPage; i++) {
//         if (i > 1 && i < totalPages) {
//             addPageNumber(i, totalPages);
//         }
//     }

//     // Mostrar "..." se necessário
//     if (currentPage < totalPages - 2) {
//         const li = document.createElement('li');
//         li.textContent = '...';
//         pageNumbers.appendChild(li);
//     }

//     // Sempre mostrar última página se houver mais de 1 página
//     if (totalPages > 1) {
//         addPageNumber(totalPages, totalPages);
//     }
// }

// function addPageNumber(page, totalPages) {
//     const pageNumbers = document.querySelector('.paginate ul');
//     const li = document.createElement('li');
//     li.textContent = page;

//     if (page === currentPage) {
//         li.classList.add('active');
//     }

//     li.addEventListener('click', () => {
//         currentPage = page;
//         renderDomains();
//     });

//     pageNumbers.appendChild(li);
// }

// // async function innerCertificate(certificados) {
// //     let rows = document.querySelector('.rows');
// //     if (!rows) return;

// //     rows.classList.remove('disabled');
// //     rows.innerHTML = '';

// //     if (!certificados) return;

// //     const lines = certificados.metrics.split('\n');

// //     allDomains = lines
// //         .map(line => {
// //             // Capturar nome do domínio
// //             const nameMatch = line.match(/,name="([^"]+)"/);
// //             if (!nameMatch) return null;

// //             let name = nameMatch[1];
// //             if (name.endsWith('-secret')) {
// //                 name = name.slice(0, -7);
// //             }

// //             // Capturar timestamp de expiração (valor no final da linha)
// //             const expirationMatch = line.match(/ ([0-9.e+-]+)$/);
// //             const expiration = expirationMatch ? parseFloat(expirationMatch[1]) : 0;

// //             return { name, expiration };
// //         })
// //         .filter(Boolean);

// //     filteredDomains = allDomains;

// //     currentPage = 1;

// //     renderDomains();
// // }
//         // Calcular tempo restante ou expirado
   

// async function main() {
//     // const certificados = await getCertExporter();
//     // console.log(certificados);
//     // await innerCertificate(certificados);
//     // setupPagination();
//     // qntdClusters = certificados.sources_count;
//     // updateCounters();
//     // return qntdClusters;
// }

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', main);
// } else {
//     main();
// }