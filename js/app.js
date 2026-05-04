const app = {

    currentPage: 'dashboard',

    init() {
        // Sidebar nav clicks
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                app.navigate(item.dataset.page);
            });
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', utils.closeModal);
        document.getElementById('modal-overlay').addEventListener('click', e => {
            if (e.target === document.getElementById('modal-overlay')) utils.closeModal();
        });

        // Global search
        const globalSearch = document.getElementById('global-search');
        const doGlobalSearch = utils.debounce(v => {
            if (!v.trim()) return;
            if (app.currentPage === 'drivers') ui.renderDrivers({ q: v });
            if (app.currentPage === 'races') ui.renderRaces({ q: v });
        });
        globalSearch.addEventListener('input', e => doGlobalSearch(e.target.value));

        // Render inicial
        app.navigate('dashboard');
    },

    navigate(page) {
        app.currentPage = page;

        // Sidebar active
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Pages visible
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`).classList.add('active');

        // Topbar nav
        app._updateTopbar(page);

        // Render
        switch (page) {
            case 'dashboard':
                ui.renderDashboard();
                break;
            case 'races':
                ui.renderRaces();
                break;
            case 'drivers':
                ui.renderDrivers();
                break;
            case 'results':
                ui.renderResults();
                break;
        }
    },

    _updateTopbar(active) {
        const pages = ['dashboard', 'races', 'drivers', 'results'];
        document.getElementById('topbar-nav').innerHTML = pages.map(p => `
      <a data-page="${p}" class="${p === active ? 'active' : ''}">${p.toUpperCase()}</a>
    `).join('');

        document.querySelectorAll('#topbar-nav a').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                app.navigate(a.dataset.page);
            });
        });
    },
};

document.addEventListener('DOMContentLoaded', () => app.init());