// Catalogo Mentors: carga desde backend y renderiza tarjetas

const API_BASE = 'http://localhost:3000';

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

function buildCard({fullName, bio, photo, sectors, availability}) {
	const sectorsText = sectors && sectors.size > 0 ? `Settori: ${Array.from(sectors).join(', ')}` : '';
	const availText = availability && availability.size > 0 ? `Disponibilità: ${Array.from(availability).join(' • ')}` : '';

	return `
		<div class="col-12">
			<div class="mentor-card">
				<img src="${photo || '../Img/default-user.png'}" class="mentor-photo" onerror="this.src='../Img/default-user.png'">
				<div class="flex-grow-1">
					<h5 class="fw-bold mb-1">${fullName}</h5>
					${bio ? `<p class="mb-1 small text-muted">${bio}</p>` : ''}
					${sectorsText ? `<p class="small mb-0">${sectorsText}</p>` : ''}
					${availText ? `<p class="small mb-0">${availText}</p>` : ''}
				</div>
				<button class="mentor-btn" title="Dettagli">+</button>
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
					availability: new Set()
				});
			}
			const item = byEmail.get(key);
			if (r.sector_name) item.sectors.add(r.sector_name);
			if (r.weekday !== null && r.weekday !== undefined) {
				const day = weekdayLabel(r.weekday);
				const slot = `${day} ${formatTime(r.start_time)}-${formatTime(r.end_time)}`.trim();
				item.availability.add(slot);
			}
		}

		const list = Array.from(byEmail.values());
		if (list.length === 0) {
			container.innerHTML = '<div class="text-muted">Nessun mentore trovato.</div>';
			return;
		}

		container.innerHTML = list.map(buildCard).join('');
	} catch (err) {
		console.error(err);
		container.innerHTML = '<div class="text-danger">Impossibile caricare i mentori.</div>';
	}
}

document.addEventListener('DOMContentLoaded', fetchMentors);
