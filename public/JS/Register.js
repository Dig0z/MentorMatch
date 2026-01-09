// Controller para Register

document.addEventListener('DOMContentLoaded', () => {
	const nameEl = document.getElementById('name');
	const surnameEl = document.getElementById('surname');
	const emailEl = document.getElementById('email');
	const pass1El = document.getElementById('password1');
	const pass2El = document.getElementById('password2');
	const roleEl = document.getElementById('role');
	const registerBtn = document.getElementById('registerBtn');

	const API_BASE = 'http://localhost:3000/api';

	registerBtn?.addEventListener('click', async () => {
		const name = nameEl?.value?.trim();
		const surname = surnameEl?.value?.trim();
		const email = emailEl?.value?.trim();
		const password1 = pass1El?.value || '';
		const password2 = pass2El?.value || '';
		const role = roleEl?.value;

		if (!name || !surname || !email || !password1 || !password2) {
			alert('Compila tutti i campi obbligatori.');
			return;
		}
		if (password1 !== password2) {
			alert('Le password non coincidono.');
			return;
		}

		const payload = {
			name,
			surname,
			email,
			password: password1,
			role
		};

		try {
			const res = await fetch(`${API_BASE}/user/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				const msg = data?.details?.map?.(e => e.message).join('\n') || data?.message || 'Errore di registrazione';
				alert(msg);
				return;
			}

			alert('Registrazione completata! Ora effettua il login.');
			window.location.href = 'Log.html';
		} catch (err) {
			console.error(err);
			alert('Impossibile contattare il server. Assicurati che il backend sia in esecuzione.');
		}
	});
});
