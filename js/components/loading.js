export function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

export async function initLoading() {
  // Verificar se o loading já existe no DOM
  let overlay = document.getElementById('loading-overlay');
  
  if (!overlay) {
    // Carregar o HTML do loading via fetch
    const res = await fetch('components/loading.html');
    const html = await res.text();
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // Mostrar o loading
  showLoading();
}
