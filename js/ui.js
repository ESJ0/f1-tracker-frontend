const ui = {

        // ─── DASHBOARD ──────────────────────────────────────────────────
        async renderDashboard() {
            const el = document.getElementById('page-dashboard');
            el.innerHTML = utils.loadingHTML();

            const [driversRes, racesRes] = await Promise.all([
                api.getDrivers({ page: 1, limit: 1 }),
                api.getRaces({ page: 1, limit: 1 }),
            ]);

            const totalDrivers = driversRes.total ?? 0;
            const totalRaces = racesRes.total ?? 0;

            const latestRaceRes = await api.getRaces({ sort: 'race_date', order: 'desc', page: 1, limit: 1 });
            const latestRace = latestRaceRes.data?.[0] ?? null;

            let recentResults = [];
            if (latestRace) {
                recentResults = await api.getRaceResults(latestRace.id);
            }

            const pct = totalRaces > 0 ? Math.round((totalRaces / 24) * 100) : 0;

            el.innerHTML = `
      <h1 class="page-title">Vista General</h1>
      <p class="page-subtitle">Telemetría en vivo y análisis estratégico de la temporada.</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div>
            <div class="stat-label">Total de Pilotos</div>
            <div class="stat-value">${totalDrivers}</div>
          </div>
          <div class="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="7" r="4"/>
              <path d="M4 21 C4 17 7.6 14 12 14 C16.4 14 20 17 20 21"/>
            </svg>
          </div>
        </div>
        <div class="stat-card">
          <div>
            <div class="stat-label">Carreras Registradas</div>
            <div class="stat-value">${totalRaces}</div>
          </div>
          <div class="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 12 Q6 4 12 4 Q18 4 21 12 Q18 20 12 20 Q6 20 3 12Z"/>
              <path d="M12 4 L12 20"/><path d="M3 12 L21 12"/>
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
            </svg>
          </div>
        </div>
        <div class="stat-card">
          <div>
            <div class="stat-label">Resultados Recientes</div>
            <div class="stat-value">${recentResults.length > 0 ? recentResults.length : '—'}</div>
          </div>
          <div class="stat-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4 L4 20 L20 20"/>
              <path d="M7 14 L10 10 L13 13 L17 7"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div>
          ${latestRace ? ui._featuredRace(latestRace) : utils.emptyHTML('Aún no hay carreras registradas')}
        </div>
        <div class="recent-results-card">
          <div class="recent-results-header">
            <span class="section-title">Resultados Recientes</span>
            ${latestRace ? `<span class="section-title" style="color:var(--red)">${latestRace.grand_prix}</span>` : ''}
          </div>
          ${recentResults.length > 0
            ? recentResults.slice(0, 5).map(r => ui._recentResultRow(r)).join('')
            : utils.emptyHTML('Sin resultados aún')}
          <div style="padding:12px 20px;text-align:center;">
            <button class="btn btn-outline btn-sm" onclick="app.navigate('results')">
              VER CLASIFICACIÓN COMPLETA
            </button>
          </div>
        </div>
      </div>

      <div class="season-bar">
        <div>
          <div class="season-bar-label">Progreso de Temporada</div>
        </div>
        <div class="season-progress-wrap">
          <div class="season-progress-track">
            <div class="season-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="season-pct">${pct}%</span>
      </div>
    `;
  },

  _featuredRace(race) {
    const img = race.image_url
      ? `<img src="${race.image_url}"
           style="height:280px;width:100%;object-fit:cover;filter:grayscale(60%) brightness(0.6);display:block;" />`
      : `<div style="height:280px;background:linear-gradient(135deg,#1a1a1a,#0a0a0a);
           display:flex;align-items:center;justify-content:center;font-size:64px;">🏁</div>`;

    return `
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
        <div style="position:relative;">
          ${img}
          <div style="position:absolute;bottom:0;left:0;right:0;padding:24px;
                      background:linear-gradient(transparent,rgba(0,0,0,0.92));">
            <div style="color:var(--red);font-size:11px;font-weight:700;
                        letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
              ${race.country} — Próxima Carrera
            </div>
            <div style="font-size:26px;font-weight:900;text-transform:uppercase;">
              ${race.circuit}
            </div>
            <div style="color:var(--text-secondary);font-size:13px;margin-top:4px;">
              ${race.country} • ${utils.formatDate(race.race_date)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _recentResultRow(r) {
    return `
      <div class="recent-result-row">
        <div class="rr-pos ${r.position === 1 ? 'p1' : ''}">${r.position}</div>
        <div class="rr-info">
          <div class="rr-name">${r.driver_name}</div>
          <div class="rr-team">${r.driver_team}</div>
        </div>
        <div class="rr-right">
          <div class="rr-gp">${r.grand_prix}</div>
          <div class="rr-pts">${r.points > 0 ? '+' + r.points + ' PTS' : '—'}</div>
        </div>
      </div>
    `;
  },

  // ─── DRIVERS ────────────────────────────────────────────────────
  async renderDrivers(params = {}) {
    const el = document.getElementById('page-drivers');
    const merged = { page: 1, limit: 12, sort: 'name', order: 'asc', ...params };

    el.innerHTML = `
      <h1 class="page-title red">Pilotos</h1>
      <p class="page-subtitle">Lista de inscritos al Campeonato Mundial de Fórmula 1 de la FIA.</p>

      <div class="section-header">
        <div class="filters-bar" style="margin:0;flex:1">
          <input class="filter-input" id="driver-search"
            placeholder="Buscar piloto..." value="${merged.q ?? ''}" />
          <select class="filter-select" id="driver-sort">
            <option value="name"       ${merged.sort==='name'       ?'selected':''}>Nombre</option>
            <option value="team"       ${merged.sort==='team'       ?'selected':''}>Equipo</option>
            <option value="number"     ${merged.sort==='number'     ?'selected':''}>Número</option>
            <option value="created_at" ${merged.sort==='created_at' ?'selected':''}>Fecha de alta</option>
          </select>
          <select class="filter-select" id="driver-order">
            <option value="asc"  ${merged.order==='asc' ?'selected':''}>ASC</option>
            <option value="desc" ${merged.order==='desc'?'selected':''}>DESC</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-left:16px">
          <button class="btn btn-primary" id="btn-add-driver">+ AÑADIR PILOTO</button>
        </div>
      </div>

      <div id="drivers-grid-wrap">${utils.loadingHTML()}</div>
      <div id="drivers-pagination"></div>
    `;

    const res = await api.getDrivers(merged);
    const drivers = res.data ?? [];
    const wrap = document.getElementById('drivers-grid-wrap');

    if (drivers.length === 0) {
      wrap.innerHTML = utils.emptyHTML('No se encontraron pilotos');
    } else {
      wrap.innerHTML = `<div class="drivers-grid">${drivers.map(d => ui._driverCard(d)).join('')}</div>`;
    }

    utils.renderPagination('drivers-pagination', merged.page, res.total_pages ?? 1,
      p => ui.renderDrivers({ ...merged, page: p }));

    const search = document.getElementById('driver-search');
    const doSearch = utils.debounce(v => ui.renderDrivers({ ...merged, q: v, page: 1 }));
    search.addEventListener('input', e => doSearch(e.target.value));

    document.getElementById('driver-sort').addEventListener('change', e =>
      ui.renderDrivers({ ...merged, sort: e.target.value, page: 1 }));
    document.getElementById('driver-order').addEventListener('change', e =>
      ui.renderDrivers({ ...merged, order: e.target.value, page: 1 }));
    document.getElementById('btn-add-driver').addEventListener('click', () =>
      ui.openDriverForm());
  },

  _driverCard(d) {
    const teamColor = utils.teamColor(d.team);
    const img = d.image_url
      ? `<img src="${d.image_url}" class="driver-card-img" alt="${d.name}" />`
      : `<div class="driver-card-img-placeholder">👤</div>`;

    return `
      <div class="driver-card">
        ${img}
        <div class="driver-card-body">
          <div class="driver-team">
            <span class="team-dot" style="background:${teamColor}"></span>
            ${d.team}
          </div>
          <div class="driver-name">${d.name}</div>
          <div class="driver-meta">
            <span class="driver-number">#${d.number}</span>
            <span class="driver-nationality">🏴 ${d.nationality}</span>
          </div>
          <div class="driver-actions">
            <button class="btn btn-outline btn-sm"
              onclick="ui.openDriverForm(${d.id})">EDITAR</button>
            <button class="btn btn-danger btn-sm"
              onclick="ui.confirmDeleteDriver(${d.id}, '${d.name}')">ELIMINAR</button>
            <button class="btn btn-outline btn-sm"
              onclick="ui.showDriverResults(${d.id}, '${d.name}')">RESULTADOS</button>
          </div>
        </div>
      </div>
    `;
  },

  async openDriverForm(id = null) {
    let driver = null;
    if (id) driver = await api.getDriver(id);

    utils.openModal(id ? 'EDITAR PILOTO' : 'AÑADIR PILOTO', `
      <div class="form-group">
        <label class="form-label">Nombre completo *</label>
        <input class="form-input" id="f-name" placeholder="Max Verstappen"
          value="${driver?.name ?? ''}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Equipo *</label>
          <input class="form-input" id="f-team" placeholder="Red Bull Racing"
            value="${driver?.team ?? ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Número *</label>
          <input class="form-input" id="f-number" type="number" placeholder="1"
            value="${driver?.number ?? ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nacionalidad *</label>
        <input class="form-input" id="f-nationality" placeholder="Holandés"
          value="${driver?.nationality ?? ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">URL de imagen</label>
        <input class="form-input" id="f-image" placeholder="https://..."
          value="${driver?.image_url ?? ''}" />
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" onclick="utils.closeModal()">CANCELAR</button>
        <button class="btn btn-primary" id="btn-save-driver">
          ${id ? 'GUARDAR CAMBIOS' : 'CREAR PILOTO'}
        </button>
      </div>
    `);

    document.getElementById('btn-save-driver').addEventListener('click', async () => {
      const data = {
        name:        document.getElementById('f-name').value.trim(),
        team:        document.getElementById('f-team').value.trim(),
        number:      parseInt(document.getElementById('f-number').value),
        nationality: document.getElementById('f-nationality').value.trim(),
        image_url:   document.getElementById('f-image').value.trim(),
      };

      if (!data.name || !data.team || !data.number || !data.nationality) {
        utils.showToast('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      const res = id ? await api.updateDriver(id, data) : await api.createDriver(data);

      if (res.error) {
        utils.showToast(res.message ?? 'Error al guardar el piloto', 'error');
        return;
      }

      utils.closeModal();
      utils.showToast(id ? 'Piloto actualizado ✓' : 'Piloto creado ✓', 'success');
      ui.renderDrivers();
    });
  },

  confirmDeleteDriver(id, name) {
    utils.openModal('ELIMINAR PILOTO', `
      <p style="color:var(--text-secondary);margin-bottom:24px;">
        ¿Estás seguro de que deseas eliminar a
        <strong style="color:#fff">${name}</strong>?
        Esto también eliminará todos sus resultados registrados.
      </p>
      <div class="form-actions">
        <button class="btn btn-outline" onclick="utils.closeModal()">CANCELAR</button>
        <button class="btn btn-primary" style="background:var(--red)"
          id="btn-confirm-del">ELIMINAR</button>
      </div>
    `);
    document.getElementById('btn-confirm-del').addEventListener('click', async () => {
      await api.deleteDriver(id);
      utils.closeModal();
      utils.showToast('Piloto eliminado', 'success');
      ui.renderDrivers();
    });
  },

  async showDriverResults(id, name) {
    const results = await api.getDriverResults(id);
    const rows = results.length > 0
      ? results.map(r => `
          <tr>
            <td class="pos-cell ${r.position <= 3 ? 'top3' : ''}">
              ${String(r.position).padStart(2,'0')}
            </td>
            <td>${r.grand_prix}</td>
            <td style="color:var(--text-secondary)">${r.circuit}</td>
            <td>${utils.formatDate(r.race_date)}</td>
            <td class="points-cell">${r.points}</td>
            <td>${r.fastest_lap ? '<span class="fl-icon">⏱</span>' : '—'}</td>
          </tr>`)
        .join('')
      : `<tr><td colspan="6">${utils.emptyHTML('Sin resultados registrados')}</td></tr>`;

    utils.openModal(`${name} — Historial de Resultados`, `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>POS</th><th>GRAN PREMIO</th><th>CIRCUITO</th>
              <th>FECHA</th><th>PUNTOS</th><th>VR</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `);
  },

  // ─── RACES ──────────────────────────────────────────────────────
  async renderRaces(params = {}) {
    const el = document.getElementById('page-races');
    const merged = { page: 1, limit: 9, sort: 'race_date', order: 'asc', ...params };

    el.innerHTML = `
      <h1 class="page-title">Calendario de <span style="color:var(--red)">Grandes Premios</span></h1>
      <p class="page-subtitle">Eventos de la temporada — fechas, circuitos y resultados.</p>

      <div class="section-header">
        <div class="filters-bar" style="margin:0;flex:1">
          <input class="filter-input" id="race-search"
            placeholder="Buscar gran premio..." value="${merged.q ?? ''}" />
          <select class="filter-select" id="race-sort">
            <option value="race_date"  ${merged.sort==='race_date'  ?'selected':''}>Fecha</option>
            <option value="grand_prix" ${merged.sort==='grand_prix' ?'selected':''}>Nombre</option>
            <option value="country"    ${merged.sort==='country'    ?'selected':''}>País</option>
          </select>
          <select class="filter-select" id="race-order">
            <option value="asc"  ${merged.order==='asc' ?'selected':''}>ASC</option>
            <option value="desc" ${merged.order==='desc'?'selected':''}>DESC</option>
          </select>
        </div>
        <div style="margin-left:16px">
          <button class="btn btn-primary" id="btn-add-race">+ AÑADIR CARRERA</button>
        </div>
      </div>

      <div id="races-grid-wrap">${utils.loadingHTML()}</div>
      <div id="races-pagination"></div>
    `;

    const res = await api.getRaces(merged);
    const races = res.data ?? [];
    const wrap = document.getElementById('races-grid-wrap');

    if (races.length === 0) {
      wrap.innerHTML = utils.emptyHTML('No se encontraron carreras');
    } else {
      wrap.innerHTML = `<div class="races-grid">${races.map((r, i) => ui._raceCard(r, i)).join('')}</div>`;
    }

    utils.renderPagination('races-pagination', merged.page, res.total_pages ?? 1,
      p => ui.renderRaces({ ...merged, page: p }));

    const search = document.getElementById('race-search');
    const doSearch = utils.debounce(v => ui.renderRaces({ ...merged, q: v, page: 1 }));
    search.addEventListener('input', e => doSearch(e.target.value));

    document.getElementById('race-sort').addEventListener('change', e =>
      ui.renderRaces({ ...merged, sort: e.target.value, page: 1 }));
    document.getElementById('race-order').addEventListener('change', e =>
      ui.renderRaces({ ...merged, order: e.target.value, page: 1 }));
    document.getElementById('btn-add-race').addEventListener('click', () =>
      ui.openRaceForm());
  },

  _raceCard(race, index) {
    const img = race.image_url
      ? `<img src="${race.image_url}"
           style="width:100%;height:160px;object-fit:cover;
                  filter:grayscale(50%) brightness(0.7);display:block;" />`
      : `<div class="race-card-img-placeholder">🏎</div>`;

    return `
      <div class="race-card">
        <div class="race-card-img-wrap">
          ${img}
          <div class="race-badge">RONDA ${String(index + 1).padStart(2,'0')}</div>
        </div>
        <div class="race-card-body">
          <div class="race-country">${race.country}</div>
          <div class="race-name">${race.grand_prix}</div>
          <div class="race-info">
            <div class="race-info-row">
              <span class="race-info-icon">📍</span>
              <span>${race.circuit}</span>
            </div>
            <div class="race-info-row">
              <span class="race-info-icon">📅</span>
              <span>${utils.formatDate(race.race_date)}</span>
            </div>
          </div>
          <div class="race-actions">
            <button class="btn btn-outline btn-sm"
              onclick="ui.openRaceForm(${race.id})">EDITAR</button>
            <button class="btn btn-danger btn-sm"
              onclick="ui.confirmDeleteRace(${race.id}, '${race.grand_prix}')">ELIMINAR</button>
            <button class="btn btn-primary btn-sm"
              onclick="ui.showRaceResults(${race.id}, '${race.grand_prix}')">RESULTADOS</button>
          </div>
        </div>
      </div>
    `;
  },

  async openRaceForm(id = null) {
    let race = null;
    if (id) race = await api.getRace(id);

    utils.openModal(id ? 'EDITAR CARRERA' : 'AÑADIR CARRERA', `
      <div class="form-group">
        <label class="form-label">Nombre del Gran Premio *</label>
        <input class="form-input" id="f-gp" placeholder="Gran Premio de Mónaco"
          value="${race?.grand_prix ?? ''}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Circuito *</label>
          <input class="form-input" id="f-circuit" placeholder="Circuit de Monaco"
            value="${race?.circuit ?? ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">País *</label>
          <input class="form-input" id="f-country" placeholder="Mónaco"
            value="${race?.country ?? ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Carrera *</label>
        <input class="form-input" id="f-date" type="date"
          value="${race?.race_date?.split('T')[0] ?? ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">URL de imagen del circuito</label>
        <input class="form-input" id="f-img" placeholder="https://..."
          value="${race?.image_url ?? ''}" />
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" onclick="utils.closeModal()">CANCELAR</button>
        <button class="btn btn-primary" id="btn-save-race">
          ${id ? 'GUARDAR CAMBIOS' : 'CREAR CARRERA'}
        </button>
      </div>
    `);

    document.getElementById('btn-save-race').addEventListener('click', async () => {
      const data = {
        grand_prix: document.getElementById('f-gp').value.trim(),
        circuit:    document.getElementById('f-circuit').value.trim(),
        country:    document.getElementById('f-country').value.trim(),
        race_date:  document.getElementById('f-date').value,
        image_url:  document.getElementById('f-img').value.trim(),
      };

      if (!data.grand_prix || !data.circuit || !data.country || !data.race_date) {
        utils.showToast('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      const res = id ? await api.updateRace(id, data) : await api.createRace(data);

      if (res.error) {
        utils.showToast(res.message ?? 'Error al guardar la carrera', 'error');
        return;
      }

      utils.closeModal();
      utils.showToast(id ? 'Carrera actualizada ✓' : 'Carrera creada ✓', 'success');
      ui.renderRaces();
    });
  },

  confirmDeleteRace(id, name) {
    utils.openModal('ELIMINAR CARRERA', `
      <p style="color:var(--text-secondary);margin-bottom:24px;">
        ¿Estás seguro de que deseas eliminar
        <strong style="color:#fff">${name}</strong>?
        Se eliminarán también todos los resultados asociados.
      </p>
      <div class="form-actions">
        <button class="btn btn-outline" onclick="utils.closeModal()">CANCELAR</button>
        <button class="btn btn-primary" style="background:var(--red)"
          id="btn-confirm-del-race">ELIMINAR</button>
      </div>
    `);
    document.getElementById('btn-confirm-del-race').addEventListener('click', async () => {
      await api.deleteRace(id);
      utils.closeModal();
      utils.showToast('Carrera eliminada', 'success');
      ui.renderRaces();
    });
  },

  async showRaceResults(raceId, raceName) {
    const results = await api.getRaceResults(raceId);

    const rows = results.length > 0
      ? results.map(r => `
          <tr>
            <td class="pos-cell ${r.position <= 3 ? 'top3' : ''}">
              ${String(r.position).padStart(2,'0')}
            </td>
            <td>
              <div class="driver-col">
                <span class="driver-col-name">${r.driver_name}</span>
                <span class="driver-col-nat">${r.driver_team}</span>
              </div>
            </td>
            <td style="color:var(--text-secondary)">${r.driver_team}</td>
            <td class="points-cell">${r.points}</td>
            <td>${r.fastest_lap ? '<span class="fl-icon">⏱</span>' : '—'}</td>
            <td>
              <button class="btn btn-danger btn-sm"
                onclick="ui.deleteResultAndRefresh(${r.id}, ${raceId}, '${raceName}')">✕</button>
            </td>
          </tr>`)
        .join('')
      : `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">
           Aún no hay resultados registrados para esta carrera
         </td></tr>`;

    utils.openModal(`${raceName} — Resultados`, `
      <div class="table-wrap" style="margin-bottom:16px">
        <table>
          <thead>
            <tr>
              <th>POS</th><th>PILOTO</th><th>CONSTRUCTOR</th>
              <th>PUNTOS</th><th>VR</th><th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <button class="btn btn-primary" style="width:100%"
        onclick="ui.openAddResultForm(${raceId}, '${raceName}')">
        + AÑADIR RESULTADO
      </button>
    `);
  },

  async openAddResultForm(raceId, raceName) {
    const driversRes = await api.getDrivers({ limit: 100 });
    const drivers = driversRes.data ?? [];

    const options = drivers.map(d =>
      `<option value="${d.id}">${d.name} (#${d.number})</option>`
    ).join('');

    utils.openModal(`AÑADIR RESULTADO — ${raceName}`, `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Piloto *</label>
          <select class="form-select" id="f-driver-id">
            <option value="">Seleccionar piloto...</option>
            ${options}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Posición *</label>
          <input class="form-input" id="f-position" type="number" min="1" max="20" placeholder="1" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Puntos *</label>
          <input class="form-input" id="f-points" type="number" min="0" placeholder="25" />
        </div>
        <div class="form-group">
          <label class="form-label">Vuelta Rápida</label>
          <select class="form-select" id="f-fl">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline"
          onclick="ui.showRaceResults(${raceId}, '${raceName}')">VOLVER</button>
        <button class="btn btn-primary" id="btn-save-result">AÑADIR RESULTADO</button>
      </div>
    `);

    document.getElementById('btn-save-result').addEventListener('click', async () => {
      const driverId   = parseInt(document.getElementById('f-driver-id').value);
      const position   = parseInt(document.getElementById('f-position').value);
      const points     = parseInt(document.getElementById('f-points').value);
      const fastestLap = document.getElementById('f-fl').value === 'true';

      if (!driverId || !position || isNaN(points)) {
        utils.showToast('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      const res = await api.createResult({
        driver_id:   driverId,
        race_id:     raceId,
        position,
        points,
        fastest_lap: fastestLap,
      });

      if (res.error) {
        utils.showToast(res.message ?? 'Error al añadir el resultado', 'error');
        return;
      }

      utils.showToast('Resultado añadido ✓', 'success');
      ui.showRaceResults(raceId, raceName);
    });
  },

  async deleteResultAndRefresh(resultId, raceId, raceName) {
    await api.deleteResult(resultId);
    utils.showToast('Resultado eliminado', 'success');
    ui.showRaceResults(raceId, raceName);
  },

  // ─── RESULTS ────────────────────────────────────────────────────
  async renderResults(params = {}) {
    const el = document.getElementById('page-results');
    const merged = { page: 1, limit: 20, ...params };

    el.innerHTML = `
      <h1 class="page-title">Clasificación del <span style="color:var(--red)">Campeonato</span></h1>
      <p class="page-subtitle">Clasificación completa y telemetría de la temporada actual.</p>

      <div class="filters-bar">
        <select class="filter-select" id="result-race-filter">
          <option value="">— Todas las carreras —</option>
        </select>
      </div>

      <div id="results-table-wrap">${utils.loadingHTML()}</div>
    `;

    const racesRes = await api.getRaces({ limit: 100 });
    const races = racesRes.data ?? [];
    const select = document.getElementById('result-race-filter');

    races.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.grand_prix} — ${utils.formatDate(r.race_date)}`;
      if (String(r.id) === String(merged.raceId)) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', e =>
      ui._loadResultsTable(e.target.value || null));

    await ui._loadResultsTable(merged.raceId ?? null);
  },

  async _loadResultsTable(raceId) {
    const wrap = document.getElementById('results-table-wrap');
    wrap.innerHTML = utils.loadingHTML();

    let results = [];
    if (raceId) {
      results = await api.getRaceResults(raceId);
    } else {
      const latestRes = await api.getRaces({ sort: 'race_date', order: 'desc', page: 1, limit: 1 });
      const latest = latestRes.data?.[0];
      if (latest) results = await api.getRaceResults(latest.id);
    }

    if (!results || results.length === 0) {
      wrap.innerHTML = utils.emptyHTML('Sin resultados — selecciona una carrera arriba');
      return;
    }

    const rows = results.map(r => `
      <tr>
        <td class="pos-cell ${r.position <= 3 ? 'top3' : ''}">
          ${String(r.position).padStart(2,'0')}
        </td>
        <td>
          <div class="driver-col">
            <span class="driver-col-name">${r.driver_name}</span>
            <span class="driver-col-nat">${r.driver_team}</span>
          </div>
        </td>
        <td style="color:var(--text-secondary);font-size:12px">${r.driver_team}</td>
        <td style="color:var(--text-secondary)">${r.grand_prix}</td>
        <td class="points-cell">${r.points}</td>
        <td>${r.fastest_lap
          ? '<span class="fl-icon">⏱</span>'
          : '<span style="color:var(--text-muted)">—</span>'}</td>
      </tr>
    `).join('');

    wrap.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>POS</th>
              <th>PILOTO</th>
              <th>CONSTRUCTOR</th>
              <th>GRAN PREMIO</th>
              <th>PUNTOS</th>
              <th>VR</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },
};