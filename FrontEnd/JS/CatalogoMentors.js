// Catalogo Mentors: carga desde backend y renderiza tarjetas

const API_BASE = 'http://localhost:3000';
let allMentors = [];

function weekdayLabel(wd) {
	const map = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
	if (wd === null || wd === undefined) return null;
	if (typeof wd === 'number' && wd >= 0 && wd < 7) return map[wd];
	// si viene como string (ej. 'monday' o 'Mon') lo devolvemos tal cual
	return String(wd);
}

function formatTime(t) {
	if (!t) return '';
	// Esperado 'HH:MM:SS' => 'HH:MM'
	const m = String(t).match(/^(\d{2}:\d{2})/);
	return m ? m[1] : String(t);
}

function buildCard({fullName, bio, photo, sectors, languages, rating, email}) {
	const sectorsText = sectors && sectors.size > 0 ? `Settori: ${Array.from(sectors).join(', ')}` : '';
	const langsText = languages && languages.size > 0 ? `Lingue: ${Array.from(languages).join(', ')}` : '';
	const badge = rating ? ` <span class="badge bg-warning text-dark">⭐ ${rating}</span>` : ` <span class="badge bg-secondary">n/d</span>`;

	return `
		<div class="col-12">
			<div class="mentor-card">
				<img src="${photo || '../Img/default-user.png'}" class="mentor-photo" onerror="this.src='../Img/default-user.png'">
				<div class="flex-grow-1">
					  <h5 class="fw-bold mb-1">${fullName}${badge}</h5>
					${bio ? `<p class="mb-1 small text-muted">${bio}</p>` : ''}
					  ${langsText ? `<p class="small mb-0">${langsText}</p>` : ''}
					${sectorsText ? `<p class="small mb-0">${sectorsText}</p>` : ''}
				</div>
				<button class="mentor-btn" title="Dettagli" data-email="${email || ''}">+</button>
			</div>
		</div>
	`;
}

async function fetchMentors() {
	const container = document.getElementById('mentorsList');
	if (!container) return;
	container.innerHTML = '<div class="text-muted">Caricamento in corso...</div>';

	try {
		const res = await fetch(`${API_BASE}/api/user/get_mentors`);
		if (res.status === 404) {
			container.innerHTML = '<div class="text-muted">Nessun mentore trovato.</div>';
			return;
		}
		if (!res.ok) throw new Error('Errore caricando i mentori');
		const payload = await res.json();
		const rows = payload?.data || [];

		// Aggrega per utente (email) perché il join può duplicare per settori/disponibilità
		const byEmail = new Map();
		for (const r of rows) {
			const key = r.email || `${r.name}|${r.surname}`;
			if (!byEmail.has(key)) {
				byEmail.set(key, {
					fullName: `${r.name ?? ''} ${r.surname ?? ''}`.trim(),
					bio: r.bio || '',
					photo: r.photo_url || '',
					sectors: new Set(),
					availability: new Set(),
					languages: new Set(),
					rating: r.avg_rating || null,
					email: r.email || ''
				});
			}
			const item = byEmail.get(key);
			if (r.sector_name) item.sectors.add(r.sector_name);
			if (r.language_name) item.languages.add(r.language_name);
			// Non mostrare disponibilità nella card del catalogo (richiesta UX)
		}

		allMentors = Array.from(byEmail.values());
		if (allMentors.length === 0) {
			container.innerHTML = '<div class="text-muted">Nessun mentore trovato.</div>';
			return;
		}

		renderList(applyFilters());
	} catch (err) {
		console.error(err);
		container.innerHTML = '<div class="text-danger">Impossibile caricare i mentori.</div>';
	}
}

document.addEventListener('DOMContentLoaded', fetchMentors);

// ---- Filtro Lingue (multi-select) ----
function getSelectedLanguages() {
	const menu = document.getElementById('langDropdownMenu');
	if (!menu) return new Set();
	const selected = new Set();
	menu.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => selected.add(chk.value));
	return selected;
}

function updateLangLabel() {
	const toggle = document.getElementById('langDropdownToggle');
	if (!toggle) return;
	const selected = Array.from(getSelectedLanguages());
	const txt = selected.length === 0 ? 'Tutte' : selected.join(', ');
	toggle.textContent = txt;
}

function setupLanguageFilter() {
	const toggle = document.getElementById('langDropdownToggle');
	const menu = document.getElementById('langDropdownMenu');
	if (!toggle || !menu) return;

	// open/close
	toggle.addEventListener('click', () => {
		menu.classList.toggle('show');
	});
	document.addEventListener('click', (e) => {
		if (!menu.contains(e.target) && !toggle.contains(e.target)) {
			menu.classList.remove('show');
		}
	});

	// checkbox logic
	const checks = Array.from(menu.querySelectorAll('input[type="checkbox"]'));
	checks.forEach(chk => {
		chk.addEventListener('change', () => {
			if (chk.value === 'Tutte' && chk.checked) {
				checks.forEach(c => { if (c.value !== 'Tutte') c.checked = false; });
			} else {
				const tutte = menu.querySelector('input[value="Tutte"]');
				if (tutte) tutte.checked = false;
			}
			updateLangLabel();
			renderList(applyFilters());
		});
	});
}

function applyFilters() {
	const langs = getSelectedLanguages();
	const sectors = getSelectedSectorsFilter();
	const ratingMin = getSelectedRatingMin();

	const useLangs = !(langs.size === 0 || langs.has('Tutte'));
	const useSectors = !(sectors.size === 0 || sectors.has('Tutti'));
	const useRating = ratingMin !== null;

	return allMentors.filter(m => {
		let okLang = true;
		let okSector = true;
		let okRating = true;

		if (useLangs) {
			okLang = !!m.languages && m.languages.size > 0 && [...langs].some(l => m.languages.has(l));
		}
		if (useSectors) {
			okSector = !!m.sectors && m.sectors.size > 0 && [...sectors].some(s => m.sectors.has(s));
		}
		if (useRating) {
			const r = Number(m.rating || 0);
			okRating = r >= ratingMin;
		}

		return okLang && okSector && okRating;
	});
}

function renderList(list) {
	const container = document.getElementById('mentorsList');
	if (!container) return;
	container.innerHTML = list.map(buildCard).join('');
}

document.addEventListener('DOMContentLoaded', () => {
	setupLanguageFilter();
	updateLangLabel();
	setupSectorFilter();
	updateSectorLabel();
	setupRatingFilter();

	// Delegated handler for '+' button: navigate to mentor profile (mentees only)
	const container = document.getElementById('mentorsList');
	container?.addEventListener('click', (e) => {
		const btn = e.target.closest('.mentor-btn');
		if (!btn) return;
		const role = localStorage.getItem('role');
		const email = btn.dataset.email;
		if (role === 'mentee' && email) {
			window.location.href = `CalatoloMentorProfile.html?email=${encodeURIComponent(email)}`;
		}
	});
});

// ---- Filtro Settori (multi-select) ----
function getSelectedSectorsFilter() {
	const menu = document.getElementById('sectorDropdownMenu');
	if (!menu) return new Set();
	const selected = new Set();
	menu.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => selected.add(chk.value));
	return selected;
}

function updateSectorLabel() {
	const toggle = document.getElementById('sectorDropdownToggle');
	if (!toggle) return;
	const selected = Array.from(getSelectedSectorsFilter());
	const txt = selected.length === 0 ? 'Tutti' : selected.join(', ');
	toggle.textContent = txt;
}

function setupSectorFilter() {
	const toggle = document.getElementById('sectorDropdownToggle');
	const menu = document.getElementById('sectorDropdownMenu');
	if (!toggle || !menu) return;

	// open/close
	toggle.addEventListener('click', () => {
		menu.classList.toggle('show');
	});
	document.addEventListener('click', (e) => {
		if (!menu.contains(e.target) && !toggle.contains(e.target)) {
			menu.classList.remove('show');
		}
	});

	// checkbox logic
	const checks = Array.from(menu.querySelectorAll('input[type="checkbox"]'));
	checks.forEach(chk => {
		chk.addEventListener('change', () => {
			if (chk.value === 'Tutti' && chk.checked) {
				checks.forEach(c => { if (c.value !== 'Tutti') c.checked = false; });
			} else {
				const tutti = menu.querySelector('input[value="Tutti"]');
				if (tutti) tutti.checked = false;
			}
			updateSectorLabel();
			renderList(applyFilters());
		});
	});
}

// ---- Filtro Valutazione (select) ----
function getSelectedRatingMin() {
	const sel = document.getElementById('ratingMinSelect');
	if (!sel) return null;
	const v = sel.value;
	if (v === '') return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}

function setupRatingFilter() {
	const sel = document.getElementById('ratingMinSelect');
	if (!sel) return;
	sel.addEventListener('change', () => {
		renderList(applyFilters());
	});
}
