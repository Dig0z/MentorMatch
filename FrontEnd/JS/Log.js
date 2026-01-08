// Controller para Log

document.addEventListener('DOMContentLoaded', () => {
	const emailEl = document.getElementById('email');
	const passEl = document.getElementById('password');
	const loginBtn = document.getElementById('loginBtn');

	const API_BASE = 'http://localhost:3000/api';

	loginBtn?.addEventListener('click', async () => {
		const email = emailEl?.value?.trim();
		const password = passEl?.value || '';

		if (!email || !password) {
			alert('Inserisci email e password.');
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/user/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				const msg = data?.details?.map?.(e => e.message).join('\n') || data?.message || 'Errore di login';
				alert(msg);
				return;
			}

			const token = data?.data?.token;
			const role = data?.data?.role;
			if (!token || !role) {
				alert('Risposta server non valida.');
				return;
			}

			localStorage.setItem('token', token);
			localStorage.setItem('role', role);

			if (role === 'mentor') {
				window.location.href = 'MentorDashBoard.html';
			} else {
				window.location.href = 'MenteeDashBoard.html';
			}
		} catch (err) {
			console.error(err);
			alert('Impossibile contattare il server.');
		}
	});
});
