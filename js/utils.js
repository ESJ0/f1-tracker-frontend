const utils = {

    // Formatea "2025-05-25" → "25 MAY 2025"
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
            'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
        ];
        const d = new Date(dateStr + 'T00:00:00');
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    },

    // Puntos F1 estándar por posición
    pointsForPosition(pos) {
        const pts = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
        return pts[pos - 1] ?? 0;
    },

    // Debounce para el search
    debounce(fn, delay = 350) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    // Toast notifications
    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        setTimeout(() => toast.classList.add('hidden'), 3000);
    },

    // Modal helpers
    openModal(title, bodyHTML) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHTML;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('modal-body').innerHTML = '';
    },

    // Render paginación
    renderPagination(containerId, current, totalPages, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = `<button class="page-btn" ${current === 1 ? 'disabled' : ''}
                  data-page="${current - 1}">‹</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || i === totalPages ||
                (i >= current - 1 && i <= current + 1)
            ) {
                html += `<button class="page-btn ${i === current ? 'active' : ''}"
                   data-page="${i}">${i}</button>`;
            } else if (i === current - 2 || i === current + 2) {
                html += `<span class="page-info">…</span>`;
            }
        }

        html += `<button class="page-btn" ${current === totalPages ? 'disabled' : ''}
               data-page="${current + 1}">›</button>`;

        container.innerHTML = html;
        container.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => onPageChange(Number(btn.dataset.page)));
        });
    },

    // Color por equipo
    teamColor(team = '') {
        const t = team.toLowerCase();
        if (t.includes('red bull')) return '#3671C6';
        if (t.includes('ferrari')) return '#E8002D';
        if (t.includes('mercedes')) return '#27F4D2';
        if (t.includes('mclaren')) return '#FF8000';
        if (t.includes('aston')) return '#229971';
        if (t.includes('alpine')) return '#FF87BC';
        if (t.includes('williams')) return '#64C4FF';
        if (t.includes('haas')) return '#B6BABD';
        if (t.includes('sauber') || t.includes('kick')) return '#52E252';
        if (t.includes('rb') || t.includes('racing bulls')) return '#6692FF';
        return '#e10600';
    },

    // Loading HTML
    loadingHTML() {
        return '<div class="loading">Loading telemetry...</div>';
    },

    // Empty state HTML
    emptyHTML(msg = 'No data found') {
        return `<div class="empty-state">
      <div class="empty-state-icon">🏁</div>
      <div class="empty-state-text">${msg}</div>
    </div>`;
    },
};