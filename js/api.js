const API_BASE = 'https://f1-tracker-backend.onrender.com';

const api = {

    // ─── DRIVERS ──────────────────────────────────────────────────────
    getDrivers(params = {}) {
        const q = new URLSearchParams();
        if (params.q) q.set('q', params.q);
        if (params.sort) q.set('sort', params.sort);
        if (params.order) q.set('order', params.order);
        if (params.page) q.set('page', params.page);
        if (params.limit) q.set('limit', params.limit);
        return fetch(`${API_BASE}/drivers?${q}`).then(r => r.json());
    },

    getDriver(id) {
        return fetch(`${API_BASE}/drivers/${id}`).then(r => r.json());
    },

    createDriver(data) {
        return fetch(`${API_BASE}/drivers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(r => r.json());
    },

    updateDriver(id, data) {
        return fetch(`${API_BASE}/drivers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(r => r.json());
    },

    deleteDriver(id) {
        return fetch(`${API_BASE}/drivers/${id}`, { method: 'DELETE' });
    },

    getDriverResults(id) {
        return fetch(`${API_BASE}/drivers/${id}/results`).then(r => r.json());
    },

    // ─── RACES ────────────────────────────────────────────────────────
    getRaces(params = {}) {
        const q = new URLSearchParams();
        if (params.q) q.set('q', params.q);
        if (params.sort) q.set('sort', params.sort);
        if (params.order) q.set('order', params.order);
        if (params.page) q.set('page', params.page);
        if (params.limit) q.set('limit', params.limit);
        return fetch(`${API_BASE}/races?${q}`).then(r => r.json());
    },

    getRace(id) {
        return fetch(`${API_BASE}/races/${id}`).then(r => r.json());
    },

    createRace(data) {
        return fetch(`${API_BASE}/races`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(r => r.json());
    },

    updateRace(id, data) {
        return fetch(`${API_BASE}/races/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(r => r.json());
    },

    deleteRace(id) {
        return fetch(`${API_BASE}/races/${id}`, { method: 'DELETE' });
    },

    getRaceResults(id) {
        return fetch(`${API_BASE}/races/${id}/results`).then(r => r.json());
    },

    // ─── RESULTS ──────────────────────────────────────────────────────
    createResult(data) {
        return fetch(`${API_BASE}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(r => r.json());
    },

    deleteResult(id) {
        return fetch(`${API_BASE}/results/${id}`, { method: 'DELETE' });
    },
};